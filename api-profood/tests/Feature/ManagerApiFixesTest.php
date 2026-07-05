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
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Regression tests for the 2026-07-05 manager-app fixes:
 *  - manager can advance a GUEST order's status (no null-customer 500)
 *  - user-management + receipt endpoints authorize by the AUTHENTICATED caller,
 *    not a client-supplied phone number, and are staff/owner scoped.
 */
class ManagerApiFixesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function makeUser(int $roleCode, string $phone): User
    {
        $roleId = Role::where('code', $roleCode)->firstOrFail()->id;
        $user = User::create([
            'first_name'    => 'Test',
            'last_name'     => 'User',
            'phone_number'  => $phone,
            'email'         => null,
            'password'      => Hash::make('Test1234!'),
            'role_id'       => $roleId,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);
        if ($roleCode === Role::CUSTOMER) {
            Customer::create(['user_id' => $user->id]);
        }

        return $user;
    }

    private function makeGuestOrder(): Order
    {
        $status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $unpaid = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();
        $order = Order::create([
            'customer_id'             => null,
            'is_guest_order'          => true,
            'guest_first_name'        => 'Awa',
            'guest_last_name'         => 'Ndiaye',
            'guest_phone_number'      => '771234567',
            'address'                 => 'Dakar',
            'montant'                 => 5000,
            'order_status_id'         => $status->id,
            'order_payment_status_id' => $unpaid->id,
            'cart_id'                 => null,
        ]);
        $order->string_id = 'GUEST-' . $order->id;
        $order->save();

        return $order;
    }

    public function test_manager_can_advance_a_guest_order_status_without_crashing()
    {
        Mail::fake();
        $manager = $this->makeUser(Role::MANAGER, '770000031');
        $order = $this->makeGuestOrder();
        $being = OrderStatus::where('code', OrderStatus::BEING_PROCESSED)->first();

        $this->actingAs($manager, 'api')->postJson('/api/update-order-status', [
            'manager_phone_number' => $manager->phone_number,
            'order_id'             => $order->id,
            'status_id'            => $being->id,
        ])->assertSuccessful();

        $this->assertEquals($being->id, $order->fresh()->order_status_id);
    }

    public function test_customer_cannot_list_users()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000032');
        $this->actingAs($customer, 'api')->getJson('/api/get-users')->assertStatus(403);
    }

    public function test_manager_can_list_users()
    {
        $manager = $this->makeUser(Role::MANAGER, '770000033');
        $this->actingAs($manager, 'api')->getJson('/api/get-users')->assertStatus(200);
    }

    public function test_customer_cannot_reset_a_password_even_by_naming_an_admin()
    {
        $admin = $this->makeUser(Role::ADMIN, '770000034');
        $customer = $this->makeUser(Role::CUSTOMER, '770000035');
        $victim = $this->makeUser(Role::CUSTOMER, '770000036');

        $this->actingAs($customer, 'api')->postJson('/api/update-user-password-by-admin', [
            'admin_phone_number'    => $admin->phone_number, // spoofed
            'user_id'               => $victim->id,
            'password'              => 'NewPass1234!',
            'password_confirmation' => 'NewPass1234!',
        ])->assertStatus(403);

        // The victim's password must be unchanged.
        $this->assertTrue(Hash::check('Test1234!', $victim->fresh()->password));
    }

    public function test_public_receipt_requires_authentication_and_staff_or_owner()
    {
        $order = $this->makeGuestOrder();

        // Unauthenticated -> 401 (endpoint moved behind auth:api).
        $this->getJson('/api/receipt/' . $order->string_id)->assertStatus(401);

        // Authenticated customer who does not own it -> 403.
        $customer = $this->makeUser(Role::CUSTOMER, '770000037');
        $this->actingAs($customer, 'api')->getJson('/api/receipt/' . $order->string_id)->assertStatus(403);

        // Staff -> 200.
        $manager = $this->makeUser(Role::MANAGER, '770000038');
        $this->actingAs($manager, 'api')->getJson('/api/receipt/' . $order->string_id)->assertStatus(200);
    }

    public function test_approve_order_requires_staff()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000039');
        $this->actingAs($customer, 'api')
            ->postJson('/api/approve-order/' . $this->makeGuestOrder()->id)
            ->assertStatus(403);

        $manager = $this->makeUser(Role::MANAGER, '770000040');
        $this->actingAs($manager, 'api')
            ->postJson('/api/approve-order/' . $this->makeGuestOrder()->id)
            ->assertSuccessful();
    }
}
