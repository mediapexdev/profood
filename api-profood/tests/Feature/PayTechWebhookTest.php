<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderPaymentStatus;
use App\Models\OrderStatus;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * PayTech IPN webhook (POST /api/redirect-payment).
 *
 * The webhook authenticates by comparing sha256 hashes of the PayTech
 * account credentials (services.paytech.*) and must mark orders as paid —
 * including guest orders, with or without a cart snapshot.
 */
class PayTechWebhookTest extends TestCase
{
    use DatabaseTransactions;

    private const API_KEY = 'test-paytech-key';
    private const API_SECRET = 'test-paytech-secret';

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
        config([
            'services.paytech.api_key'    => self::API_KEY,
            'services.paytech.api_secret' => self::API_SECRET,
        ]);
    }

    /**
     * Create a guest order through the real endpoint (with cart snapshot).
     */
    private function createGuestOrder(): Order
    {
        Mail::fake();

        $boxType = \App\Models\BoxType::first();
        $response = $this->postJson('/api/guest-order', [
            'order_id'           => sha1('paytech-webhook-test'),
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'guest_email'        => '',
            'address'            => 'Boulga, Ouakam, Dakar',
            'montant'            => 1,
            'cart_items'         => [
                ['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1],
            ],
        ]);
        $response->assertStatus(201);

        return Order::where('string_id', $response->json('order.string_id'))->firstOrFail();
    }

    private function ipnPayload(Order $order, string $key = self::API_KEY, string $secret = self::API_SECRET): array
    {
        return [
            'type_event'        => 'sale_complete',
            'item_name'         => $order->string_id,
            'payment_method'    => 'Orange Money',
            'api_key_sha256'    => hash('sha256', $key),
            'api_secret_sha256' => hash('sha256', $secret),
        ];
    }

    public function test_webhook_marks_a_guest_order_with_cart_snapshot_as_paid()
    {
        $order = $this->createGuestOrder();
        $this->assertNotNull($order->cart_id);

        $this->post('/api/redirect-payment', $this->ipnPayload($order))
            ->assertSuccessful();

        $paid = OrderPaymentStatus::where('code', OrderPaymentStatus::PAID)->first();
        $this->assertEquals($paid->id, $order->fresh()->order_payment_status_id);
        $this->assertEquals('Orange Money', $order->fresh()->payment_method);
    }

    public function test_webhook_survives_legacy_guest_orders_without_cart()
    {
        // Orders created before cart snapshots have cart_id null
        $status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $unpaid = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();

        $order = Order::create([
            'customer_id'             => null,
            'is_guest_order'          => true,
            'guest_first_name'        => 'Legacy',
            'guest_last_name'         => 'Guest',
            'guest_phone_number'      => '771234567',
            'address'                 => 'Dakar',
            'montant'                 => 5000,
            'order_status_id'         => $status->id,
            'order_payment_status_id' => $unpaid->id,
            'cart_id'                 => null,
        ]);
        $order->string_id = 'LEGACY-' . $order->id;
        $order->save();

        $this->post('/api/redirect-payment', $this->ipnPayload($order))
            ->assertSuccessful();

        $paid = OrderPaymentStatus::where('code', OrderPaymentStatus::PAID)->first();
        $this->assertEquals($paid->id, $order->fresh()->order_payment_status_id);
    }

    public function test_webhook_rejects_invalid_credentials()
    {
        $order = $this->createGuestOrder();
        $unpaidStatusId = $order->order_payment_status_id;

        $this->post('/api/redirect-payment', $this->ipnPayload($order, 'wrong-key', 'wrong-secret'))
            ->assertSuccessful();

        // Payment status must NOT have changed
        $this->assertEquals($unpaidStatusId, $order->fresh()->order_payment_status_id);
    }
}
