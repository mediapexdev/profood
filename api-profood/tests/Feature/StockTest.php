<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Inventory tracking: stock is reserved when an order is placed (this is a
 * cash-on-delivery business, so we cannot wait for a payment webhook) and
 * restored when the order is cancelled. Ordering is never blocked — stock is
 * allowed to go negative and the manager is warned ("allow + alert").
 */
class StockTest extends TestCase
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

    /**
     * Guest-order payload ordering slice A twice inside a box and three times
     * standalone (5 total), plus slice B once inside the box.
     */
    private function guestOrderPayload(Slice $a, Slice $b, BoxType $boxType): array
    {
        return [
            'order_id'           => sha1('stock-test-' . $a->id . '-' . $b->id),
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
                        ['slice_id' => $a->id, 'quantity' => 2],
                        ['slice_id' => $b->id, 'quantity' => 1],
                    ],
                ],
                [
                    'type'     => 'slice',
                    'slice_id' => $a->id,
                    'quantity' => 3,
                ],
            ],
        ];
    }

    public function test_placing_an_order_decrements_tracked_stock_and_leaves_untracked_alone()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        $a = $slices[0];
        $b = $slices[1];

        // A is tracked, B is not (null stock = unlimited).
        $a->update(['stock_quantity' => 100, 'low_stock_threshold' => 5]);
        $b->update(['stock_quantity' => null]);

        $this->postJson('/api/guest-order', $this->guestOrderPayload($a, $b, $boxType))
            ->assertStatus(201);

        // A ordered 5 units (2 in box + 3 standalone) -> 95.
        $this->assertSame(95, $a->fresh()->stock_quantity);
        // B is untracked and must stay null even though it was ordered.
        $this->assertNull($b->fresh()->stock_quantity);
    }

    public function test_ordering_is_allowed_when_out_of_stock_and_stock_can_go_negative()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        $a = $slices[0];
        $b = $slices[1];

        // Only 4 in stock but 5 will be ordered.
        $a->update(['stock_quantity' => 4, 'low_stock_threshold' => 5]);
        $b->update(['stock_quantity' => null]);

        $this->postJson('/api/guest-order', $this->guestOrderPayload($a, $b, $boxType))
            ->assertStatus(201);

        $fresh = $a->fresh();
        $this->assertSame(-1, $fresh->stock_quantity);
        $this->assertSame('out_of_stock', $fresh->stock_status);
    }

    public function test_cancelling_an_order_restores_stock_once()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        $a = $slices[0];
        $b = $slices[1];

        $a->update(['stock_quantity' => 100]);
        $b->update(['stock_quantity' => null]);

        $reference = $this->postJson('/api/guest-order', $this->guestOrderPayload($a, $b, $boxType))
            ->assertStatus(201)
            ->json('order.string_id');

        $this->assertSame(95, $a->fresh()->stock_quantity);

        $order = Order::where('string_id', $reference)->firstOrFail();
        $manager = $this->makeManager('770000097');
        $cancelled = OrderStatus::where('code', OrderStatus::CANCELLED)->firstOrFail();

        $cancelPayload = [
            'manager_phone_number' => '770000097',
            'order_id'             => $order->id,
            'status_id'            => $cancelled->id,
        ];

        $this->actingAs($manager, 'api')->postJson('/api/update-order-status', $cancelPayload)
            ->assertStatus(200);

        // Stock is back to its pre-order level.
        $this->assertSame(100, $a->fresh()->stock_quantity);

        // Cancelling again must not restore a second time.
        $this->actingAs($manager, 'api')->postJson('/api/update-order-status', $cancelPayload)
            ->assertStatus(200);

        $this->assertSame(100, $a->fresh()->stock_quantity);
    }

    public function test_stock_status_accessor_reflects_thresholds()
    {
        $untracked = new Slice(['stock_quantity' => null]);
        $this->assertSame('untracked', $untracked->stock_status);

        $out = new Slice(['stock_quantity' => 0]);
        $this->assertSame('out_of_stock', $out->stock_status);

        $low = new Slice(['stock_quantity' => 3, 'low_stock_threshold' => 5]);
        $this->assertSame('low_stock', $low->stock_status);

        $inStock = new Slice(['stock_quantity' => 100, 'low_stock_threshold' => 5]);
        $this->assertSame('in_stock', $inStock->stock_status);
    }
}
