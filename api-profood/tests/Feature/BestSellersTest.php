<?php

namespace Tests\Feature;

use App\Models\BoxType;
use App\Models\Customer;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Best-sellers report: staff-only, aggregates sold units from the immutable
 * cart snapshots (box units, standalone slice qty, in-box slice qty).
 */
class BestSellersTest extends TestCase
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

    private function placeGuestOrder(int $boxTypeId, int $inBoxSliceId, int $standaloneSliceId): void
    {
        $this->postJson('/api/guest-order', [
            'order_id'           => sha1(uniqid('bs', true)),
            'guest_first_name'   => 'Awa',
            'guest_last_name'    => 'Ndiaye',
            'guest_phone_number' => '771234567',
            'guest_email'        => '',
            'address'            => 'Dakar',
            'montant'            => 1,
            'cart_items'         => [
                [
                    'type'        => 'box',
                    'box_type_id' => $boxTypeId,
                    'quantity'    => 1,
                    'slices'      => [['slice_id' => $inBoxSliceId, 'quantity' => 2]],
                ],
                ['type' => 'slice', 'slice_id' => $standaloneSliceId, 'quantity' => 3],
            ],
        ])->assertStatus(201);
    }

    public function test_customer_cannot_access_best_sellers()
    {
        $customer = $this->makeUser(Role::CUSTOMER, '770000097');
        $this->actingAs($customer, 'api')->getJson('/api/get-best-sellers')->assertStatus(403);
    }

    public function test_best_sellers_aggregates_units_from_cart_snapshots()
    {
        Mail::fake();

        $boxType = BoxType::first();
        $slices = Slice::take(2)->get();
        $this->assertNotNull($boxType);
        $this->assertTrue($slices->count() >= 2);

        // Two identical orders: 2 boxes, in-box slice qty 2*2=4, standalone slice qty 3*2=6.
        $this->placeGuestOrder($boxType->id, $slices[0]->id, $slices[1]->id);
        $this->placeGuestOrder($boxType->id, $slices[0]->id, $slices[1]->id);

        $manager = $this->makeUser(Role::MANAGER, '770000098');
        $response = $this->actingAs($manager, 'api')->getJson('/api/get-best-sellers?limit=100');
        $response->assertStatus(200);

        // The test DB may already hold seeded orders, so assert our contribution
        // additively (our 2 orders add 2 boxes, 6 standalone + 4 in-box slice units).
        $box = collect($response->json('box_types'))->firstWhere('box_type_id', $boxType->id);
        $this->assertNotNull($box, 'Box type must appear in best sellers');
        $this->assertGreaterThanOrEqual(2, $box['units']);
        // Box-type revenue is attributed (units * price).
        $this->assertGreaterThan(0, $box['revenue']);

        $standalone = collect($response->json('slices'))->firstWhere('slice_id', $slices[1]->id);
        $this->assertNotNull($standalone);
        $this->assertGreaterThanOrEqual(6, $standalone['standalone_units']);

        $inBox = collect($response->json('slices'))->firstWhere('slice_id', $slices[0]->id);
        $this->assertNotNull($inBox);
        $this->assertGreaterThanOrEqual(4, $inBox['in_box_units']);
    }
}
