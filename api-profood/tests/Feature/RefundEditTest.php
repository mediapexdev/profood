<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\DeliverySettings;
use App\Models\Localite;
use App\Models\Order;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Order editing (delivery/contact details) and record-only refunds.
 */
class RefundEditTest extends TestCase
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

        return User::create([
            'first_name' => 'Test', 'last_name' => 'User', 'phone_number' => $phone, 'email' => null,
            'password' => Hash::make('Test1234!'), 'role_id' => $roleId,
            'active' => true, 'logged' => false, 'session_count' => 0,
        ]);
    }

    private function createGuestOrder(): Order
    {
        Mail::fake();
        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();

        $reference = $this->postJson('/api/guest-order', [
            'order_id'           => sha1('refund-edit-' . uniqid()),
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'guest_email'        => '',
            'address'            => 'Ouakam, Dakar',
            'montant'            => 1,
            'cart_items'         => [
                ['type' => 'slice', 'slice_id' => $slices[0]->id, 'quantity' => 3],
            ],
        ])->assertStatus(201)->json('order.string_id');

        return Order::where('string_id', $reference)->firstOrFail();
    }

    public function test_customer_cannot_record_a_refund()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000071');
        $order = $this->createGuestOrder();

        $this->actingAs($customer, 'api')
            ->postJson('/api/add-refund', ['order_id' => $order->id, 'amount' => 500])
            ->assertStatus(403);
    }

    public function test_staff_records_refunds_and_cannot_exceed_the_total()
    {
        $manager = $this->makeUser(Role::MANAGER, '770000072');
        $order = $this->createGuestOrder();
        $total = (int) $order->montant;

        // A partial refund is accepted.
        $this->actingAs($manager, 'api')
            ->postJson('/api/add-refund', ['order_id' => $order->id, 'amount' => 1000, 'reason' => 'Article manquant'])
            ->assertStatus(201);

        // Refunding more than what remains is rejected.
        $this->actingAs($manager, 'api')
            ->postJson('/api/add-refund', ['order_id' => $order->id, 'amount' => $total])
            ->assertStatus(422);

        // Refunding exactly the remainder brings the total refunded to the order total.
        $this->actingAs($manager, 'api')
            ->postJson('/api/add-refund', ['order_id' => $order->id, 'amount' => $total - 1000])
            ->assertStatus(201);

        $this->assertSame($total, (int) $order->refunds()->sum('amount'));
    }

    public function test_customer_cannot_edit_order_details()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000073');
        $order = $this->createGuestOrder();

        $this->actingAs($customer, 'api')
            ->postJson('/api/update-order-details', ['order_id' => $order->id, 'address' => 'Hacked'])
            ->assertStatus(403);
    }

    public function test_editing_the_locality_recomputes_the_delivery_fee_and_total()
    {
        DeliverySettings::current()->update(['default_fee' => 0, 'free_shipping_threshold' => null]);

        $manager = $this->makeUser(Role::MANAGER, '770000074');
        $order = $this->createGuestOrder();
        $subtotal = (int) $order->montant; // default fee 0 → montant == subtotal

        $localite = Localite::with('commune')->whereHas('commune')->first();
        $localite->commune->update(['delivery_fee' => 2000]);

        $this->actingAs($manager, 'api')
            ->postJson('/api/update-order-details', [
                'order_id'    => $order->id,
                'address'     => 'Nouvelle adresse',
                'localite_id' => $localite->id,
            ])
            ->assertStatus(200);

        $fresh = $order->fresh();
        $this->assertSame(2000, (int) $fresh->delivery_fee);
        $this->assertSame($subtotal + 2000, (int) $fresh->montant);
        $this->assertSame('Nouvelle adresse', $fresh->address);
        $this->assertSame($localite->id, (int) $fresh->localite_id);
    }
}
