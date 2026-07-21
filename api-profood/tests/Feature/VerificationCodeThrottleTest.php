<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use App\Models\VerificationCodesLog;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * The verification SMS quota (3 per 30 minutes and per phone number) used to
 * be sticky : nothing ever cleared it, so a user who had already asked for
 * three codes stayed locked out even after successfully resetting their
 * password. The quota must now be released as soon as the flow it protects
 * has succeeded.
 */
class VerificationCodeThrottleTest extends TestCase
{
    use DatabaseTransactions;

    protected string $phone = '778889977';

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);

        putenv('PROFOOD_APP_KEY=test-app-key');
        $_ENV['PROFOOD_APP_KEY'] = 'test-app-key';

        $role = Role::firstOrCreate(['code' => Role::CUSTOMER], ['name' => 'Client']);

        $user = User::create([
            'first_name'    => 'Awa',
            'last_name'     => 'Ndiaye',
            'phone_number'  => $this->phone,
            'password'      => Hash::make('ancien-mot-de-passe'),
            'role_id'       => $role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);
        Customer::create(['user_id' => $user->id]);
    }

    /** @test */
    public function it_blocks_a_fourth_code_request_and_says_how_long_to_wait(): void
    {
        VerificationCodesLog::create([
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
            'sent'         => 3,
        ]);

        $response = $this->postJson('/api/user-phonenumber-exists', [
            'app_key'      => 'test-app-key',
            'phone_number' => $this->phone,
        ]);

        $response->assertStatus(429);
        $this->assertStringContainsString('30 minutes', $response->json('message'));
    }

    /** @test */
    public function the_quota_starts_over_once_the_window_has_expired(): void
    {
        $log = VerificationCodesLog::create([
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
            'sent'         => 3,
        ]);
        // Older than the 30-minute window.
        $log->updated_at = Carbon::now()->subMinutes(45);
        $log->saveQuietly();

        // Twilio is not reachable from the test suite : the request fails at the
        // SMS step (500), which is proof enough that it got past the throttle.
        $response = $this->postJson('/api/user-phonenumber-exists', [
            'app_key'      => 'test-app-key',
            'phone_number' => $this->phone,
        ]);

        $this->assertNotEquals(429, $response->status());
        $this->assertSame(1, (int) $log->fresh()->sent);
    }

    /** @test */
    public function a_successful_password_reset_clears_the_quota(): void
    {
        // Le code envoyé par SMS est désormais vérifié côté serveur : la
        // demande de réinitialisation doit le transporter.
        VerificationCodesLog::create([
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
            'sent'         => 3,
            'code_hash'    => Hash::make('ABC123'),
            'expires_at'   => Carbon::now()->addMinutes(10),
            'attempts'     => 0,
        ]);

        $this->postJson('/api/password-reset', [
            'app_key'               => 'test-app-key',
            'phone_number'          => $this->phone,
            'code'                  => 'ABC123',
            'password'              => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ])->assertStatus(200);

        $this->assertDatabaseMissing('verification_codes_logs', [
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
        ]);

        // The user is free to ask for a new code straight away.
        $response = $this->postJson('/api/user-phonenumber-exists', [
            'app_key'      => 'test-app-key',
            'phone_number' => $this->phone,
        ]);
        $this->assertNotEquals(429, $response->status());
    }
}
