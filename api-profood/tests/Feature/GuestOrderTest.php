<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\Slice;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Guest order content persistence.
 *
 * A guest order must store its content as a cart snapshot (Cart -> Box +
 * BoxSlice / CartSlice) exactly like an authenticated order, so managers
 * can see what was ordered.
 */
class GuestOrderTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // The guest routes carry a tight per-IP throttle; irrelevant in tests
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    /**
     * Build a valid guest-order payload from the seeded catalogue.
     *
     * @param  array  $overrides
     *
     * @return array
     */
    private function guestOrderPayload(array $overrides = []): array
    {
        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();

        return array_merge([
            'order_id'           => sha1('guest-order-test'),
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
                [
                    'type'     => 'slice',
                    'slice_id' => $slices[0]->id,
                    'quantity' => 3,
                ],
            ],
        ], $overrides);
    }

    public function test_guest_order_persists_its_content_as_a_cart_snapshot()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        $this->assertNotNull($boxType, 'Seeded catalogue required (box_types)');
        $this->assertTrue($slices->count() >= 2, 'Seeded catalogue required (slices)');

        $response = $this->postJson('/api/guest-order', $this->guestOrderPayload());

        $response->assertStatus(201);
        $reference = $response->json('order.string_id');
        $this->assertNotEmpty($reference);

        $order = Order::where('string_id', $reference)->first();
        $this->assertNotNull($order);
        $this->assertTrue((bool)$order->is_guest_order);
        $this->assertNotNull($order->cart_id, 'Guest order must reference a cart snapshot');

        $cart = Cart::find($order->cart_id);
        $this->assertNotNull($cart);
        $this->assertNull($cart->customer_id);
        $this->assertFalse((bool)$cart->is_current);

        // One box with its full composition
        $boxes = $cart->boxes()->get();
        $this->assertCount(1, $boxes);
        $this->assertEquals($boxType->id, $boxes[0]->box_type_id);
        $boxSlices = $boxes[0]->box_slices()->orderBy('slice_id')->get();
        $this->assertCount(2, $boxSlices);
        $this->assertEqualsCanonicalizing(
            [
                ['slice_id' => $slices[0]->id, 'quantity' => 2],
                ['slice_id' => $slices[1]->id, 'quantity' => 1],
            ],
            $boxSlices->map(fn ($bs) => ['slice_id' => $bs->slice_id, 'quantity' => $bs->quantity])->all()
        );

        // One standalone slice line
        $cartSlices = $cart->slices()->get();
        $this->assertCount(1, $cartSlices);
        $this->assertEquals($slices[0]->id, $cartSlices[0]->slice_id);
        $this->assertEquals(3, $cartSlices[0]->quantity);

        // Server-side total: box price + slice price * quantity
        $expected = $boxType->price + ($slices[0]->price * 3);
        $this->assertEquals($expected, (float)$order->montant);

        // The manager app reads order.cart.boxes_data / slices_data
        $serialized = Order::with('cart')->find($order->id)->toArray();
        $this->assertCount(1, $serialized['cart']['boxes_data']);
        $this->assertCount(2, $serialized['cart']['boxes_data'][0]['box_slices']);
        $this->assertCount(1, $serialized['cart']['slices_data']);
    }

    public function test_guest_order_rejects_non_positive_quantities()
    {
        Mail::fake();

        $payload = $this->guestOrderPayload();
        $payload['cart_items'][1]['quantity'] = 0;

        $this->postJson('/api/guest-order', $payload)->assertStatus(422);
    }

    public function test_guest_order_rejects_unknown_products()
    {
        Mail::fake();

        $payload = $this->guestOrderPayload();
        $payload['cart_items'][1]['slice_id'] = 999999999;

        $this->postJson('/api/guest-order', $payload)->assertStatus(422);
    }

    public function test_guest_order_caps_box_quantity()
    {
        Mail::fake();

        $payload = $this->guestOrderPayload();
        $payload['cart_items'][0]['quantity'] = 21;

        $this->postJson('/api/guest-order', $payload)->assertStatus(422);
    }

    public function test_guest_order_caps_total_box_units()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $payload = $this->guestOrderPayload();
        // 31 box units spread over several lines to bypass the per-line cap
        $payload['cart_items'] = array_map(
            fn () => ['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 16],
            range(1, 2)
        );
        $payload['cart_items'][] = ['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 16];

        $this->postJson('/api/guest-order', $payload)->assertStatus(422);
    }

    public function test_free_delivery_promo_with_crafted_delivery_fee_cannot_make_montant_negative()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        // Server-authoritative subtotal: box price + slice price * quantity.
        $expectedSubtotal = $boxType->price + ($slices[0]->price * 3);

        Promotion::create([
            'code'                 => 'FREELIV',
            'name'                 => 'Livraison gratuite',
            'discount_type'        => Promotion::TYPE_FREE_DELIVERY,
            'discount_value'       => 0,
            'minimum_order_amount' => 0,
            'is_active'            => true,
            'first_order_only'     => false,
            'usage_count'          => 0,
        ]);

        // A free_delivery code returns the delivery fee as the discount. A crafted
        // delivery_fee must NOT be trusted, otherwise the order montant goes negative.
        $payload = $this->guestOrderPayload([
            'promotion_code' => 'FREELIV',
            'delivery_fee'   => 999999999,
        ]);

        $response = $this->postJson('/api/guest-order', $payload);
        $response->assertStatus(201);

        $order = Order::where('string_id', $response->json('order.string_id'))->first();
        $this->assertNotNull($order);
        $this->assertGreaterThanOrEqual(0, (float) $order->montant, 'Order montant must never be negative');
        // Delivery fee is not trusted from the client, so free delivery discounts 0.
        $this->assertEquals($expectedSubtotal, (float) $order->montant);
    }

    public function test_guest_order_rejects_soft_deleted_composition_slices()
    {
        Mail::fake();

        // A slice not otherwise used by the payload (which uses the first two)
        $trashed = Slice::skip(2)->first();
        $this->assertNotNull($trashed, 'Seeded catalogue required (3+ slices)');
        $trashed->delete(); // soft delete inside the test transaction

        $payload = $this->guestOrderPayload();
        $payload['cart_items'][0]['slices'][0]['slice_id'] = $trashed->id;

        $this->postJson('/api/guest-order', $payload)->assertStatus(422);
    }
}
