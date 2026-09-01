<?php

namespace Tests\Feature;

use App\Models\Admin;
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
 * The e-mail address is optional for every account (customers sign up with a
 * phone number, and most livreurs simply have no e-mail). A blank field must
 * be stored as NULL : the users.email column is unique, so two accounts saved
 * with an empty string would collide.
 */
class OptionalEmailTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);

        $admin_role = Role::firstOrCreate(['code' => Role::ADMIN], ['name' => 'Admin']);
        Role::firstOrCreate(['code' => Role::LIVREUR], ['name' => 'Livreur']);
        Role::firstOrCreate(['code' => Role::CUSTOMER], ['name' => 'Client']);

        $this->admin = User::create([
            'first_name'    => 'Admin',
            'last_name'     => 'Test',
            'phone_number'  => '778880001',
            'email'         => 'admin.optional-email@profood.test',
            'password'      => Hash::make('12345678'),
            'role_id'       => $admin_role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);
        Admin::create(['user_id' => $this->admin->id]);
    }

    protected function livreurPayload(string $phone, $email): array
    {
        return [
            'admin_phone_number'    => $this->admin->phone_number,
            'role_id'               => Role::where('code', Role::LIVREUR)->first()->id,
            'first_name'            => 'Moussa',
            'last_name'             => 'Fall',
            'phone_number'          => $phone,
            'email'                 => $email,
            'password'              => 'motdepasse1',
            'password_confirmation' => 'motdepasse1',
            'avatar_input_action'   => 'none',
        ];
    }

    /** @test */
    public function two_livreurs_can_be_created_without_an_email(): void
    {
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-user', $this->livreurPayload('778880002', ''))
            ->assertStatus(200);

        // An empty string stored as '' would break the unique index here.
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-user', $this->livreurPayload('778880003', null))
            ->assertStatus(200);

        $this->assertNull(User::where('phone_number', '778880002')->first()->email);
        $this->assertNull(User::where('phone_number', '778880003')->first()->email);
    }

    /** @test */
    public function a_customer_can_sign_up_without_an_email(): void
    {
        // L'inscription exige désormais le code de vérification émis par le
        // serveur lors de l'étape précédente.
        VerificationCodesLog::create([
            'phone_number' => '778880004',
            'for'          => 'REGISTRATION',
            'sent'         => 1,
            'code_hash'    => Hash::make('A1B2C3'),
            'expires_at'   => Carbon::now()->addMinutes(10),
            'attempts'     => 0,
        ]);

        $response = $this->postJson('/api/signup', [
            'app_key'               => env('PROFOOD_APP_KEY'),
            'first_name'            => 'Awa',
            'last_name'             => 'Ndiaye',
            'phone_number'          => '778880004',
            'email'                 => '',
            'code'                  => 'A1B2C3',
            'password'              => 'motdepasse1',
            'password_confirmation' => 'motdepasse1',
            'avatar_input_action'   => 'none',
        ]);

        $response->assertStatus(200);
        $this->assertNull(User::where('phone_number', '778880004')->first()->email);
    }

    /** @test */
    public function a_real_email_is_still_validated_and_kept_unique(): void
    {
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-user', $this->livreurPayload('778880005', 'pas-un-email'))
            ->assertStatus(422);

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-user', $this->livreurPayload('778880006', $this->admin->email))
            ->assertStatus(422);
    }

    /** @test */
    public function an_admin_can_edit_a_livreur_and_clear_its_email(): void
    {
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-user', $this->livreurPayload('778880007', 'moussa@profood.test'))
            ->assertStatus(200);
        $livreur = User::where('phone_number', '778880007')->first();

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/update-user-profile-details-by-admin', [
                'admin_phone_number'  => $this->admin->phone_number,
                'user_id'             => $livreur->id,
                'role_id'             => $livreur->role_id,
                'first_name'          => 'Moussa',
                'last_name'           => 'Fall',
                'phone_number'        => '778880007',
                'email'               => '',
                'avatar_input_action' => 'none',
            ])
            ->assertStatus(200);

        $this->assertNull($livreur->fresh()->email);
    }

    /** @test */
    public function an_admin_can_edit_a_customer_without_an_email(): void
    {
        $payload = $this->livreurPayload('778880008', '');
        unset($payload['role_id']);
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/add-customer', $payload)
            ->assertStatus(200);
        $customer = Customer::where('user_id', User::where('phone_number', '778880008')->first()->id)->first();

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/update-customer-profile-details', [
                'admin_phone_number'  => $this->admin->phone_number,
                'customer_id'         => $customer->id,
                'first_name'          => 'Awa',
                'last_name'           => 'Diop',
                'phone_number'        => '778880008',
                'email'               => '',
                'avatar_input_action' => 'none',
            ])
            ->assertStatus(200);

        $this->assertSame('Awa', $customer->user->fresh()->first_name);
        $this->assertNull($customer->user->fresh()->email);
    }
}
