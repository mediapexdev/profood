<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use App\Http\Controllers\UserController;
use App\Models\VerificationCodesLog;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * La réinitialisation de mot de passe se contentait autrefois de vérifier le
 * numéro de téléphone et la clé applicative : le code de vérification était
 * renvoyé au client dans la réponse JSON puis comparé en JavaScript.
 * Connaître un numéro suffisait donc à prendre le contrôle d'un compte.
 *
 * Le code est désormais émis, stocké haché et vérifié côté serveur.
 */
class PasswordResetSecurityTest extends TestCase
{
    use DatabaseTransactions;

    protected string $phone = '778889966';

    protected string $code = 'A1B2C3';

    protected User $user;

    /**
     * Valeur d'origine de PROFOOD_APP_KEY, restaurée après le test pour ne
     * pas polluer les suites suivantes.
     */
    protected $original_app_key;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);

        $this->original_app_key = getenv('PROFOOD_APP_KEY');
        putenv('PROFOOD_APP_KEY=test-app-key');
        $_ENV['PROFOOD_APP_KEY'] = 'test-app-key';

        $role = Role::firstOrCreate(['code' => Role::CUSTOMER], ['name' => 'Client']);

        $this->user = User::create([
            'first_name'    => 'Fatou',
            'last_name'     => 'Sow',
            'phone_number'  => $this->phone,
            'password'      => Hash::make('ancien-mot-de-passe'),
            'role_id'       => $role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);
        Customer::create(['user_id' => $this->user->id]);
    }

    protected function tearDown(): void
    {
        if($this->original_app_key === false){
            putenv('PROFOOD_APP_KEY');
            unset($_ENV['PROFOOD_APP_KEY']);
        }
        else {
            putenv('PROFOOD_APP_KEY=' . $this->original_app_key);
            $_ENV['PROFOOD_APP_KEY'] = $this->original_app_key;
        }
        parent::tearDown();
    }

    /**
     * Émet un code de vérification valide pour le numéro de test.
     */
    protected function issueCode(array $overrides = []): VerificationCodesLog
    {
        return VerificationCodesLog::create(array_merge([
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
            'sent'         => 1,
            'code_hash'    => Hash::make($this->code),
            'expires_at'   => Carbon::now()->addMinutes(10),
            'attempts'     => 0,
            'consumed_at'  => null,
        ], $overrides));
    }

    /**
     * Corps de requête d'une réinitialisation.
     */
    protected function payload(?string $code): array
    {
        $data = [
            'app_key'               => 'test-app-key',
            'phone_number'          => $this->phone,
            'password'              => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ];
        if($code !== null){
            $data['code'] = $code;
        }
        return $data;
    }

    /**
     * Le mot de passe stocké est-il toujours l'ancien ?
     */
    protected function assertPasswordUnchanged(): void
    {
        $this->assertTrue(Hash::check('ancien-mot-de-passe', $this->user->fresh()->password));
    }

    /** @test */
    public function it_refuses_a_reset_without_any_code(): void
    {
        $this->issueCode();

        $response = $this->postJson('/api/password-reset', $this->payload(null));

        $response->assertStatus(422);
        $this->assertSame('Code de vérification invalide ou expiré', $response->json('message'));
        $this->assertPasswordUnchanged();
    }

    /** @test */
    public function it_refuses_a_reset_with_a_wrong_code(): void
    {
        $log = $this->issueCode();

        $response = $this->postJson('/api/password-reset', $this->payload('ZZZZZZ'));

        $response->assertStatus(422);
        $this->assertSame('Code de vérification invalide ou expiré', $response->json('message'));
        $this->assertSame(1, (int) $log->fresh()->attempts);
        $this->assertPasswordUnchanged();
    }

    /** @test */
    public function it_refuses_a_reset_with_an_expired_code(): void
    {
        $this->issueCode(['expires_at' => Carbon::now()->subMinute()]);

        $response = $this->postJson('/api/password-reset', $this->payload($this->code));

        $response->assertStatus(422);
        $this->assertSame('Code de vérification invalide ou expiré', $response->json('message'));
        $this->assertPasswordUnchanged();
    }

    /** @test */
    public function it_refuses_a_reset_once_five_attempts_have_been_burnt(): void
    {
        $log = $this->issueCode();

        // Cinq saisies erronées épuisent le quota de tentatives.
        for($i = 0; $i < 5; $i++){
            $this->postJson('/api/password-reset', $this->payload('ZZZZZZ'))->assertStatus(422);
        }
        $this->assertSame(5, (int) $log->fresh()->attempts);

        // Même le bon code ne passe plus.
        $response = $this->postJson('/api/password-reset', $this->payload($this->code));

        $response->assertStatus(422);
        $this->assertSame('Code de vérification invalide ou expiré', $response->json('message'));
        $this->assertPasswordUnchanged();
    }

    /** @test */
    public function it_accepts_a_reset_with_the_right_code(): void
    {
        $this->issueCode();

        $response = $this->postJson('/api/password-reset', $this->payload($this->code));

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('nouveau-mot-de-passe', $this->user->fresh()->password));
    }

    /** @test */
    public function a_code_cannot_be_used_twice(): void
    {
        $this->issueCode();

        $this->postJson('/api/password-reset', $this->payload($this->code))->assertStatus(200);

        // Le succès efface le quota d'envoi : on rejoue un code identique
        // pour prouver qu'un code déjà consommé ne rouvre pas la porte.
        $this->issueCode(['consumed_at' => Carbon::now()]);

        $response = $this->postJson('/api/password-reset', array_merge(
            $this->payload($this->code),
            [
                'password'              => 'encore-un-mot-de-passe',
                'password_confirmation' => 'encore-un-mot-de-passe',
            ]
        ));

        $response->assertStatus(422);
        $this->assertSame('Code de vérification invalide ou expiré', $response->json('message'));
        // Le mot de passe reste celui posé par la première réinitialisation.
        $this->assertTrue(Hash::check('nouveau-mot-de-passe', $this->user->fresh()->password));
    }

    /** @test */
    public function the_code_is_never_returned_in_the_json_response(): void
    {
        // L'environnement de test n'est pas 'local' : l'envoi passe par
        // Twilio, injoignable ici. Quelle que soit l'issue, la réponse ne doit
        // jamais transporter le code.
        $response = $this->postJson('/api/user-phonenumber-exists', [
            'app_key'      => 'test-app-key',
            'phone_number' => $this->phone,
        ]);

        $this->assertNull($response->json('code'));
        $this->assertStringNotContainsString('"code"', $response->getContent());
        $this->assertFalse($this->app->environment('local'));
    }

    /** @test */
    public function the_intermediate_check_endpoint_does_not_consume_the_code(): void
    {
        $log = $this->issueCode();

        $this->postJson('/api/check-verification-code', [
            'app_key'      => 'test-app-key',
            'phone_number' => $this->phone,
            'for'          => 'PASSWORD_RESET',
            'code'         => $this->code,
        ])->assertStatus(200);

        $this->assertNull($log->fresh()->consumed_at);

        // Le code reste utilisable pour l'appel final.
        $this->postJson('/api/password-reset', $this->payload($this->code))->assertStatus(200);
    }

    /** @test */
    public function signup_requires_a_valid_registration_code(): void
    {
        $new_phone = '778889955';

        $payload = [
            'app_key'               => 'test-app-key',
            'first_name'            => 'Moussa',
            'last_name'             => 'Diop',
            'phone_number'          => $new_phone,
            'avatar_input_action'   => 'none',
            'password'              => 'mot-de-passe-solide',
            'password_confirmation' => 'mot-de-passe-solide',
        ];

        // Sans code : refusé.
        $this->postJson('/api/signup', $payload)->assertStatus(422);
        $this->assertDatabaseMissing('users', ['phone_number' => $new_phone]);

        // Avec un mauvais code : refusé.
        VerificationCodesLog::create([
            'phone_number' => $new_phone,
            'for'          => 'REGISTRATION',
            'sent'         => 1,
            'code_hash'    => Hash::make($this->code),
            'expires_at'   => Carbon::now()->addMinutes(10),
            'attempts'     => 0,
        ]);
        $this->postJson('/api/signup', array_merge($payload, ['code' => 'ZZZZZZ']))->assertStatus(422);
        $this->assertDatabaseMissing('users', ['phone_number' => $new_phone]);

        // Avec le bon code : accepté.
        $this->postJson('/api/signup', array_merge($payload, ['code' => $this->code]))->assertStatus(200);
        $this->assertDatabaseHas('users', ['phone_number' => $new_phone]);
    }

    /**
     * Les champs OTP des apps (inputMode numeric) rejettent les lettres :
     * un code alphanumérique était impossible à saisir, pour le reset comme
     * pour l'inscription qui partagent ce générateur.
     */
    public function test_generated_verification_code_is_six_digits(): void
    {
        $method = new \ReflectionMethod(UserController::class, 'generateVerificationCode');
        $method->setAccessible(true);
        $controller = app(UserController::class);

        for ($i = 0; $i < 200; $i++) {
            $this->assertMatchesRegularExpression('/^\d{6}$/', $method->invoke($controller));
        }
    }
}
