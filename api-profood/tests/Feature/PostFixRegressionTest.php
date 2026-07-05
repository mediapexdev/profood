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
use Tests\TestCase;

/**
 * Regression tests for the 2026-07-05 client-flow fixes:
 *  - order-history endpoint must be scoped to the authenticated caller (IDOR)
 *  - registration must accept names with apostrophes/hyphens (N'Diaye, Anne-Marie)
 */
class PostFixRegressionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function makeCustomer(string $phone): User
    {
        $roleId = Role::where('code', Role::CUSTOMER)->firstOrFail()->id;

        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'Client',
            'phone_number' => $phone,
            'email' => null,
            'password' => Hash::make('Test1234!'),
            'role_id' => $roleId,
            'active' => true,
            'logged' => false,
            'session_count' => 0,
        ]);
        Customer::create(['user_id' => $user->id]);

        return $user;
    }

    public function test_customer_cannot_read_another_customers_order_history()
    {
        $victim = $this->makeCustomer('770000011');
        $attacker = $this->makeCustomer('770000012');

        // The attacker, authenticated as themselves, targets the victim's id.
        $this->actingAs($attacker, 'api')
            ->getJson('/api/get-customer-orders-by-user/'.$victim->id)
            ->assertStatus(403);
    }

    public function test_customer_can_read_their_own_order_history()
    {
        $user = $this->makeCustomer('770000013');
        $customer = Customer::where('user_id', $user->id)->firstOrFail();

        $status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $unpaid = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();
        $order = Order::create([
            'customer_id' => $customer->id,
            'address' => 'Dakar',
            'montant' => 5000,
            'order_status_id' => $status->id,
            'order_payment_status_id' => $unpaid->id,
            'cart_id' => null,
        ]);
        $order->string_id = 'OWN-'.$order->id;
        $order->save();

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/get-customer-orders-by-user/'.$user->id)
            ->assertStatus(200);

        $this->assertCount(1, $response->json());
    }

    public function test_signup_accepts_names_with_apostrophe_and_hyphen()
    {
        $this->postJson('/api/signup', [
            'first_name' => "N'Diaye",
            'last_name' => 'Anne-Marie',
            'phone_number' => '770000021',
            'password' => 'Test1234!',
            'password_confirmation' => 'Test1234!',
            'avatar_input_action' => 'none',
        ])->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'phone_number' => '770000021',
            'first_name' => "N'Diaye",
            'last_name' => 'Anne-Marie',
        ]);
    }

    public function test_signup_still_rejects_numeric_names()
    {
        $this->postJson('/api/signup', [
            'first_name' => '12345',
            'last_name' => 'Client',
            'phone_number' => '770000022',
            'password' => 'Test1234!',
            'password_confirmation' => 'Test1234!',
            'avatar_input_action' => 'none',
        ])->assertStatus(422);
    }
}
