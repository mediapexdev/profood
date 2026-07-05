<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderPaymentStatus;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Staff-created (phone / walk-in) orders: authenticated + staff-gated, reuses
 * the guest-order machinery, server-authoritative total, no PayTech.
 */
class ManualOrderTest extends TestCase
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

    public function test_customer_cannot_create_a_manual_order()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000091');
        $boxType = BoxType::first();

        $this->actingAs($customer, 'api')->postJson('/api/add-manual-order', [
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'address'            => 'Dakar',
            'cart_items'         => [['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1]],
        ])->assertStatus(403);
    }

    public function test_manager_creates_a_walk_in_order_with_server_side_total()
    {
        Mail::fake();

        $manager = $this->makeUser(Role::MANAGER, '770000092');
        $boxType = BoxType::first();
        $slice = Slice::first();
        $expected = $boxType->price + $slice->price * 2;

        $response = $this->actingAs($manager, 'api')->postJson('/api/add-manual-order', [
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'address'            => 'Dakar',
            'montant'            => 999999, // client total must be ignored
            'cart_items'         => [
                ['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1, 'slices' => [['slice_id' => $slice->id, 'quantity' => 1]]],
                ['type' => 'slice', 'slice_id' => $slice->id, 'quantity' => 2],
            ],
        ]);
        $response->assertStatus(201);

        $order = Order::where('string_id', $response->json('order.string_id'))->first();
        $this->assertNotNull($order);
        $this->assertTrue((bool) $order->is_guest_order);
        $this->assertNull($order->customer_id);
        $this->assertNotNull($order->cart_id, 'Manual order must persist a cart snapshot');
        $this->assertEquals($expected, (float) $order->montant);
    }

    public function test_manager_creates_an_order_for_an_existing_customer_and_can_mark_paid()
    {
        Mail::fake();

        $manager = $this->makeUser(Role::MANAGER, '770000093');
        $customerUser = $this->makeUser(Role::CUSTOMER, '770000094');
        $customer = Customer::where('user_id', $customerUser->id)->first();
        $boxType = BoxType::first();

        $response = $this->actingAs($manager, 'api')->postJson('/api/add-manual-order', [
            'customer_id' => $customer->id,
            'address'     => 'Dakar',
            'mark_paid'   => true,
            'cart_items'  => [['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1]],
        ]);
        $response->assertStatus(201);

        $order = Order::where('string_id', $response->json('order.string_id'))->first();
        $this->assertNotNull($order);
        $this->assertFalse((bool) $order->is_guest_order);
        $this->assertEquals($customer->id, $order->customer_id);

        $paid = OrderPaymentStatus::where('code', OrderPaymentStatus::PAID)->first();
        $this->assertEquals($paid->id, $order->order_payment_status_id);
    }

    public function test_manual_order_requires_contact_details_when_no_customer()
    {
        $manager = $this->makeUser(Role::MANAGER, '770000095');
        $boxType = BoxType::first();

        // No customer_id and no guest_* details -> validation 422.
        $this->actingAs($manager, 'api')->postJson('/api/add-manual-order', [
            'address'    => 'Dakar',
            'cart_items' => [['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1]],
        ])->assertStatus(422);
    }
}
