<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\DeliveryProof;
use App\Models\Livreur;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Proof of delivery: the livreur confirms a drop-off with an optional photo,
 * a complete/partial flag and a note. Proof is never required, and partial
 * deliveries are recorded (not amount-recomputed) for the manager to reconcile.
 */
class DeliveryProofTest extends TestCase
{
    use DatabaseTransactions;

    /** A genuinely decodable JPEG data URL (built with GD so Intervention can read it). */
    private function samplePhoto(): string
    {
        $im = imagecreatetruecolor(8, 8);
        imagefill($im, 0, 0, imagecolorallocate($im, 200, 100, 50));
        ob_start();
        imagejpeg($im);
        $bin = (string) ob_get_clean();
        imagedestroy($im);

        return 'data:image/jpeg;base64,' . base64_encode($bin);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
        Storage::fake('public');
    }

    private function makeLivreur(string $phone): Livreur
    {
        $roleId = Role::where('code', Role::LIVREUR)->firstOrFail()->id;

        $user = User::create([
            'first_name'    => 'Test',
            'last_name'     => 'Livreur',
            'phone_number'  => $phone,
            'email'         => null,
            'password'      => Hash::make('Test1234!'),
            'role_id'       => $roleId,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
        ]);

        return Livreur::create(['user_id' => $user->id]);
    }

    private function makeAssignedOrder(Livreur $livreur): Order
    {
        $boxType = BoxType::first();
        $slice = Slice::first();

        $reference = $this->postJson('/api/guest-order', [
            'order_id'           => sha1('proof-' . $livreur->id . '-' . $slice->id),
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'guest_email'        => '',
            'address'            => 'Boulga, Ouakam, Dakar',
            'montant'            => 1,
            'cart_items'         => [
                ['type' => 'slice', 'slice_id' => $slice->id, 'quantity' => 2],
                ['type' => 'box', 'box_type_id' => $boxType->id, 'quantity' => 1,
                    'slices' => [['slice_id' => $slice->id, 'quantity' => 1]]],
            ],
        ])->assertStatus(201)->json('order.string_id');

        $order = Order::where('string_id', $reference)->firstOrFail();
        $order->livreur_id = $livreur->id;
        $order->save();

        return $order;
    }

    public function test_livreur_confirms_delivery_with_photo_and_marks_it_delivered()
    {
        $livreur = $this->makeLivreur('770000200');
        $order = $this->makeAssignedOrder($livreur);
        $delivered = OrderStatus::where('code', OrderStatus::DELIVERED)->firstOrFail();

        $this->actingAs($livreur->user, 'api')
            ->postJson('/api/livreur-confirm-delivery', [
                'order_id'    => $order->id,
                'is_complete' => true,
                'photos'      => [$this->samplePhoto()],
                'items'       => [['name' => 'Bavette', 'quantity' => 2, 'delivered' => true]],
            ])
            ->assertStatus(200)
            ->assertJsonPath('proof.is_complete', true);

        $proof = DeliveryProof::where('order_id', $order->id)->firstOrFail();
        $this->assertCount(1, $proof->photos);
        $this->assertStringContainsString('/api/image/illustrations/delivery_proofs/', $proof->photos[0]);
        $this->assertTrue($proof->is_complete);
        $this->assertSame($livreur->id, $proof->livreur_id);

        // The order is now delivered.
        $this->assertSame($delivered->id, $order->fresh()->order_status_id);
    }

    public function test_confirmation_without_photo_is_allowed_and_partial_is_recorded()
    {
        $livreur = $this->makeLivreur('770000201');
        $order = $this->makeAssignedOrder($livreur);

        $this->actingAs($livreur->user, 'api')
            ->postJson('/api/livreur-confirm-delivery', [
                'order_id'    => $order->id,
                'is_complete' => false,
                'note'        => 'Client absent pour un article, reste remis',
            ])
            ->assertStatus(200);

        $proof = DeliveryProof::where('order_id', $order->id)->firstOrFail();
        $this->assertSame([], $proof->photos);
        $this->assertFalse($proof->is_complete);
        $this->assertSame('Client absent pour un article, reste remis', $proof->note);
    }

    public function test_confirming_twice_upserts_a_single_proof_row()
    {
        $livreur = $this->makeLivreur('770000202');
        $order = $this->makeAssignedOrder($livreur);

        $payload = ['order_id' => $order->id, 'is_complete' => true];
        $this->actingAs($livreur->user, 'api')->postJson('/api/livreur-confirm-delivery', $payload)->assertStatus(200);
        $this->actingAs($livreur->user, 'api')->postJson('/api/livreur-confirm-delivery', $payload)->assertStatus(200);

        $this->assertSame(1, DeliveryProof::where('order_id', $order->id)->count());
    }

    public function test_livreur_cannot_confirm_an_order_not_assigned_to_them()
    {
        $owner = $this->makeLivreur('770000203');
        $other = $this->makeLivreur('770000204');
        $order = $this->makeAssignedOrder($owner);

        $this->actingAs($other->user, 'api')
            ->postJson('/api/livreur-confirm-delivery', ['order_id' => $order->id])
            ->assertStatus(404);

        $this->assertSame(0, DeliveryProof::where('order_id', $order->id)->count());
    }

    public function test_invalid_photo_payload_is_rejected_with_422()
    {
        $livreur = $this->makeLivreur('770000205');
        $order = $this->makeAssignedOrder($livreur);

        $this->actingAs($livreur->user, 'api')
            ->postJson('/api/livreur-confirm-delivery', [
                'order_id' => $order->id,
                'photos'   => ['not-valid-base64!!'],
            ])
            ->assertStatus(422);

        $this->assertSame(0, DeliveryProof::where('order_id', $order->id)->count());
    }
}
