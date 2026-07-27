<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\DeliverySettings;
use App\Models\Localite;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Zone-based delivery fees: server-authoritative, per-commune with a global
 * default, free above a configurable threshold, added to the order total.
 */
class DeliveryFeeTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function makeManager(string $phone): User
    {
        $roleId = Role::where('code', Role::MANAGER)->firstOrFail()->id;

        return User::create([
            'first_name'    => 'Test',
            'last_name'     => 'Manager',
            'phone_number'  => $phone,
            'email'         => null,
            'password'      => Hash::make('Test1234!'),
            'role_id'       => $roleId,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);
    }

    private function guestOrderPayload(array $overrides = []): array
    {
        $boxType = BoxType::first();
        // Sans ORDER BY, Postgres peut renvoyer les lignes dans un ordre qui
        // varie d'un run à l'autre : le payload et expectedSubtotal() doivent
        // impérativement voir les mêmes découpes.
        $slices = Slice::orderBy('id')->take(2)->get();

        return array_merge([
            'order_id'           => sha1('delivery-test'),
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'guest_email'        => '',
            'address'            => 'Boulga, Ouakam, Dakar',
            'montant'            => 1,
            'cart_items'         => [
                [
                    'type'        => 'box',
                    'box_type_id' => $boxType->id,
                    'quantity'    => 1,
                    'slices'      => [
                        ['slice_id' => $slices[0]->id, 'quantity' => 2],
                        ['slice_id' => $slices[1]->id, 'quantity' => 1],
                    ],
                ],
                ['type' => 'slice', 'slice_id' => $slices[0]->id, 'quantity' => 3],
            ],
        ], $overrides);
    }

    private function expectedSubtotal(): int
    {
        $boxType = BoxType::first();
        $slice = Slice::orderBy('id')->take(2)->get()[0];

        return $boxType->price + ($slice->price * 3);
    }

    public function test_quote_returns_default_fee_and_is_free_above_threshold()
    {
        DeliverySettings::current()->update(['default_fee' => 1500, 'free_shipping_threshold' => 100000]);

        $this->postJson('/api/quote-delivery-fee', ['subtotal' => 5000])
            ->assertStatus(200)
            ->assertJson(['delivery_fee' => 1500, 'free_shipping_applied' => false]);

        $this->postJson('/api/quote-delivery-fee', ['subtotal' => 150000])
            ->assertStatus(200)
            ->assertJson(['delivery_fee' => 0, 'free_shipping_applied' => true]);
    }

    public function test_quote_uses_the_commune_fee_for_a_locality()
    {
        DeliverySettings::current()->update(['default_fee' => 1000, 'free_shipping_threshold' => null]);

        $localite = Localite::with('commune')->whereHas('commune')->first();
        $this->assertNotNull($localite, 'Seeded localités required');
        $localite->commune->update(['delivery_fee' => 2500]);

        $this->postJson('/api/quote-delivery-fee', ['localite_id' => $localite->id, 'subtotal' => 5000])
            ->assertStatus(200)
            ->assertJson(['delivery_fee' => 2500]);
    }

    public function test_guest_order_adds_the_delivery_fee_to_the_total()
    {
        Mail::fake();
        DeliverySettings::current()->update(['default_fee' => 1200, 'free_shipping_threshold' => null]);

        $reference = $this->postJson('/api/guest-order', $this->guestOrderPayload())
            ->assertStatus(201)
            ->json('order.string_id');

        $order = Order::where('string_id', $reference)->firstOrFail();
        $this->assertSame(1200, (int) $order->delivery_fee);
        $this->assertEquals($this->expectedSubtotal() + 1200, (float) $order->montant);
    }

    public function test_free_delivery_promo_nets_out_the_delivery_fee_without_going_negative()
    {
        Mail::fake();
        DeliverySettings::current()->update(['default_fee' => 1500, 'free_shipping_threshold' => null]);

        Promotion::create([
            'code'                 => 'FREELIVZONE',
            'name'                 => 'Livraison offerte',
            'discount_type'        => Promotion::TYPE_FREE_DELIVERY,
            'discount_value'       => 0,
            'minimum_order_amount' => 0,
            'is_active'            => true,
            'first_order_only'     => false,
            'usage_count'          => 0,
        ]);

        $reference = $this->postJson('/api/guest-order', $this->guestOrderPayload(['promotion_code' => 'FREELIVZONE']))
            ->assertStatus(201)
            ->json('order.string_id');

        $order = Order::where('string_id', $reference)->firstOrFail();
        // subtotal + 1500 delivery - 1500 discount = subtotal.
        $this->assertEquals($this->expectedSubtotal(), (float) $order->montant);
        $this->assertGreaterThanOrEqual(0, (float) $order->montant);
    }

    public function test_customer_cannot_update_delivery_settings_but_staff_can()
    {
        $customerRole = Role::where('code', Role::CUSTOMER)->firstOrFail()->id;
        $customer = User::create([
            'first_name' => 'C', 'last_name' => 'C', 'phone_number' => '770000061', 'email' => null,
            'password' => Hash::make('Test1234!'), 'role_id' => $customerRole,
            'active' => true, 'logged' => false, 'session_count' => 0,
        ]);

        $this->actingAs($customer, 'api')
            ->postJson('/api/update-delivery-settings', ['default_fee' => 5000])
            ->assertStatus(403);

        $manager = $this->makeManager('770000062');
        $this->actingAs($manager, 'api')
            ->postJson('/api/update-delivery-settings', ['default_fee' => 2000, 'free_shipping_threshold' => 80000])
            ->assertStatus(200);

        $this->assertSame(2000, DeliverySettings::current()->default_fee);
        $this->assertSame(80000, DeliverySettings::current()->free_shipping_threshold);
    }
}
