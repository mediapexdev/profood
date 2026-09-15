<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderPaymentStatus;
use App\Models\OrderStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccountDeletionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function makeUser(int $roleCode, string $phone, ?string $email = null): User
    {
        $user = User::create([
            'first_name'    => 'Awa',
            'last_name'     => 'Ndiaye',
            'phone_number'  => $phone,
            'email'         => $email,
            'password'      => Hash::make('Test1234!'),
            'role_id'       => Role::where('code', $roleCode)->firstOrFail()->id,
            'active'        => true,
            'logged'        => true,
            'session_count' => 1,
        ]);
        if ($roleCode === Role::CUSTOMER) {
            Customer::create(['user_id' => $user->id]);
        }

        return $user;
    }

    private function makeOrder(User $user, int $statusCode): Order
    {
        $order = Order::create([
            'customer_id'             => Customer::where('user_id', $user->id)->value('id'),
            'is_guest_order'          => false,
            'address'                 => 'Dakar',
            'montant'                 => 5000,
            'order_status_id'         => OrderStatus::where('code', $statusCode)->value('id'),
            'order_payment_status_id' => OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->value('id'),
            'cart_id'                 => null,
        ]);
        $order->string_id = 'TEST-DEL-' . $order->id;
        $order->save();

        return $order;
    }

    public function test_customer_deletes_own_account_and_identity_is_anonymized()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000091', 'suppression-test@example.com');
        $customerId = Customer::where('user_id', $user->id)->value('id');

        $this->actingAs($user, 'api')
            ->postJson('/api/delete-account', ['password' => 'Test1234!'])
            ->assertStatus(200);

        $deleted = User::withTrashed()->find($user->id);
        $this->assertNotNull($deleted->deleted_at);
        $this->assertNull($deleted->email);
        $this->assertNull($deleted->api_token);
        $this->assertFalse((bool) $deleted->active);
        $this->assertNotSame('Awa', $deleted->first_name);
        $this->assertFalse(Hash::check('Test1234!', $deleted->password));
        $this->assertFalse(User::withTrashed()->where('phone_number', '770000091')->exists());
        $this->assertSoftDeleted('customers', ['id' => $customerId]);
    }

    public function test_previous_token_is_rejected_after_deletion()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000092');
        $token = Str::random(60);
        $user->forceFill(['api_token' => $token])->save();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/delete-account', ['password' => 'Test1234!'])
            ->assertStatus(200);

        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/customer')
            ->assertStatus(401);
    }

    public function test_wrong_password_keeps_the_account()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000093');

        $this->actingAs($user, 'api')
            ->postJson('/api/delete-account', ['password' => 'mauvais'])
            ->assertStatus(403);

        $this->assertNull(User::withTrashed()->find($user->id)->deleted_at);
    }

    public function test_password_is_required()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000094');

        $this->actingAs($user, 'api')->postJson('/api/delete-account', [])->assertStatus(422);
        $this->assertNull(User::withTrashed()->find($user->id)->deleted_at);
    }

    public function test_staff_accounts_cannot_self_delete()
    {
        $manager = $this->makeUser(Role::MANAGER, '770000095');

        $this->actingAs($manager, 'api')
            ->postJson('/api/delete-account', ['password' => 'Test1234!'])
            ->assertStatus(403);

        $this->assertNull(User::withTrashed()->find($manager->id)->deleted_at);
    }

    public function test_guest_cannot_call_the_endpoint()
    {
        $this->postJson('/api/delete-account', ['password' => 'Test1234!'])->assertStatus(401);
    }

    public function test_open_order_blocks_deletion()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000096');
        $this->makeOrder($user, OrderStatus::IN_THE_PROCESS_OF_DELIVERY);

        $this->actingAs($user, 'api')
            ->postJson('/api/delete-account', ['password' => 'Test1234!'])
            ->assertStatus(409);

        $this->assertNull(User::withTrashed()->find($user->id)->deleted_at);
    }

    public function test_delivered_orders_are_kept_after_deletion()
    {
        $user = $this->makeUser(Role::CUSTOMER, '770000097');
        $order = $this->makeOrder($user, OrderStatus::DELIVERED);

        $this->actingAs($user, 'api')
            ->postJson('/api/delete-account', ['password' => 'Test1234!'])
            ->assertStatus(200);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'deleted_at' => null]);
    }
}
