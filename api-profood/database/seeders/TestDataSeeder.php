<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\BoxType;
use App\Models\Cart;
use App\Models\Box;
use App\Models\Customer;
use App\Models\Manager;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderStatus;
use App\Models\OrderPaymentStatus;
use App\Models\Promotion;
use App\Models\Slice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeds test data for the manager app:
 * - 2 new users (1 Manager, 1 Admin)
 * - Additional promotions with various states
 * - Orders spread across all statuses for Kanban testing
 * - Promotional prices on some BoxTypes and Slices
 */
class TestDataSeeder extends Seeder
{
    public function run()
    {
        $this->createManagerAndAdminUsers();
        $this->createPromotions();
        $this->createTestOrders();
        $this->setPromotionalPrices();
    }

    /**
     * Create 1 Manager + 1 Admin user for the manager app.
     */
    private function createManagerAndAdminUsers()
    {
        $password = \bcrypt('12345678');

        // Manager user
        $managerUser = User::firstOrCreate(
            ['phone_number' => '771234567'],
            [
                'first_name'    => 'Moussa',
                'last_name'     => 'Diallo',
                'email'         => 'moussa.diallo@profood.sn',
                'password'      => $password,
                'role_id'       => 3, // Manager
                'active'        => true,
                'logged'        => false,
                'session_count' => 0,
            ]
        );

        if ($managerUser->wasRecentlyCreated) {
            Manager::firstOrCreate(['user_id' => $managerUser->id]);
            $this->command->info("Manager created: moussa.diallo@profood.sn / 771234567 / 12345678");
        } else {
            $this->command->info("Manager already exists: 771234567");
        }

        // Admin user
        $adminUser = User::firstOrCreate(
            ['phone_number' => '779876543'],
            [
                'first_name'    => 'Fatou',
                'last_name'     => 'Ndiaye',
                'email'         => 'fatou.ndiaye@profood.sn',
                'password'      => $password,
                'role_id'       => 1, // Admin
                'active'        => true,
                'logged'        => false,
                'session_count' => 0,
            ]
        );

        if ($adminUser->wasRecentlyCreated) {
            Admin::firstOrCreate(['user_id' => $adminUser->id]);
            $this->command->info("Admin created: fatou.ndiaye@profood.sn / 779876543 / 12345678");
        } else {
            $this->command->info("Admin already exists: 779876543");
        }
    }

    /**
     * Create test promotions in various states.
     */
    private function createPromotions()
    {
        $promotions = [
            [
                'code'                  => 'BIENVENUE10',
                'name'                  => 'Bienvenue 10%',
                'description'           => 'Réduction de 10% pour les nouveaux clients',
                'discount_type'         => 'percentage',
                'discount_value'        => 10,
                'minimum_order_amount'  => 5000,
                'usage_limit_total'     => 100,
                'usage_limit_per_user'  => 1,
                'starts_at'             => Carbon::now()->subDays(7),
                'expires_at'            => Carbon::now()->addDays(30),
                'is_active'             => true,
                'first_order_only'      => true,
            ],
            [
                'code'                  => 'LIVGRATUITE',
                'name'                  => 'Livraison gratuite',
                'description'           => 'Livraison offerte pour les commandes de +15 000 Fcfa',
                'discount_type'         => 'free_delivery',
                'discount_value'        => 0,
                'minimum_order_amount'  => 15000,
                'usage_limit_total'     => null,
                'usage_limit_per_user'  => 3,
                'starts_at'             => Carbon::now()->subDays(3),
                'expires_at'            => Carbon::now()->addDays(60),
                'is_active'             => true,
                'first_order_only'      => false,
            ],
            [
                'code'                  => 'TABASKI2026',
                'name'                  => 'Promo Tabaski',
                'description'           => 'Promotion spéciale fête de Tabaski',
                'discount_type'         => 'fixed_amount',
                'discount_value'        => 3000,
                'minimum_order_amount'  => 20000,
                'usage_limit_total'     => 50,
                'usage_limit_per_user'  => 1,
                'starts_at'             => Carbon::now()->addDays(15),
                'expires_at'            => Carbon::now()->addDays(45),
                'is_active'             => true,
                'first_order_only'      => false,
            ],
            [
                'code'                  => 'EXPIRE2025',
                'name'                  => 'Promo expirée',
                'description'           => 'Cette promotion a expiré',
                'discount_type'         => 'percentage',
                'discount_value'        => 20,
                'minimum_order_amount'  => 0,
                'usage_limit_total'     => 10,
                'usage_limit_per_user'  => 1,
                'starts_at'             => Carbon::now()->subDays(60),
                'expires_at'            => Carbon::now()->subDays(5),
                'is_active'             => true,
                'first_order_only'      => false,
            ],
            [
                'code'                  => 'DESACTIVE01',
                'name'                  => 'Promo désactivée',
                'description'           => 'Cette promotion est inactive',
                'discount_type'         => 'percentage',
                'discount_value'        => 15,
                'minimum_order_amount'  => 0,
                'usage_limit_total'     => null,
                'usage_limit_per_user'  => 1,
                'starts_at'             => null,
                'expires_at'            => null,
                'is_active'             => false,
                'first_order_only'      => false,
            ],
        ];

        foreach ($promotions as $promoData) {
            Promotion::firstOrCreate(
                ['code' => $promoData['code']],
                $promoData
            );
        }

        $this->command->info("Promotions seeded: " . Promotion::count() . " total");
    }

    /**
     * Create test orders spread across all statuses for Kanban testing.
     */
    private function createTestOrders()
    {
        // Get a customer to associate orders with
        $customer = Customer::first();
        if (!$customer) {
            $this->command->warn("No customer found — skipping order creation");
            return;
        }

        $paymentPaid = OrderPaymentStatus::where('code', 8)->first();
        $paymentUnpaid = OrderPaymentStatus::where('code', 16)->first();

        $statuses = OrderStatus::all()->keyBy('code');

        // Get a box type for creating carts
        $boxType = BoxType::first();

        $ordersData = [
            // En attente (code 8) — 4 commandes
            ['status' => 8, 'montant' => 12500, 'payment' => $paymentPaid,   'days_ago' => 0],
            ['status' => 8, 'montant' => 25000, 'payment' => $paymentUnpaid, 'days_ago' => 1],
            ['status' => 8, 'montant' => 8700,  'payment' => $paymentPaid,   'days_ago' => 0],
            ['status' => 8, 'montant' => 31000, 'payment' => $paymentPaid,   'days_ago' => 2],

            // En traitement (code 16) — 3 commandes
            ['status' => 16, 'montant' => 18500, 'payment' => $paymentPaid, 'days_ago' => 2],
            ['status' => 16, 'montant' => 9200,  'payment' => $paymentPaid, 'days_ago' => 3],
            ['status' => 16, 'montant' => 22000, 'payment' => $paymentPaid, 'days_ago' => 1],

            // En livraison (code 32) — 2 commandes
            ['status' => 32, 'montant' => 15000, 'payment' => $paymentPaid, 'days_ago' => 3],
            ['status' => 32, 'montant' => 27500, 'payment' => $paymentPaid, 'days_ago' => 2],

            // Livrées (code 64) — 3 commandes
            ['status' => 64, 'montant' => 20000, 'payment' => $paymentPaid, 'days_ago' => 5],
            ['status' => 64, 'montant' => 14000, 'payment' => $paymentPaid, 'days_ago' => 7],
            ['status' => 64, 'montant' => 35000, 'payment' => $paymentPaid, 'days_ago' => 4],

            // Annulées (code 80) — 1 commande
            ['status' => 80, 'montant' => 11000, 'payment' => $paymentUnpaid, 'days_ago' => 6],
        ];

        $created = 0;
        foreach ($ordersData as $i => $data) {
            $status = $statuses[$data['status']] ?? null;
            if (!$status) continue;

            $createdAt = Carbon::now()->subDays($data['days_ago']);
            $stringId = 'TEST-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);

            // Skip if already exists
            if (Order::where('string_id', $stringId)->exists()) continue;

            // Create a cart for this order
            $cart = Cart::create([
                'customer_id' => $customer->id,
                'is_current'  => false,
            ]);

            // Add a box to the cart if box type exists
            if ($boxType) {
                Box::create([
                    'box_type_id' => $boxType->id,
                    'cart_id'     => $cart->id,
                ]);
            }

            $order = Order::create([
                'string_id'               => $stringId,
                'cart_id'                 => $cart->id,
                'customer_id'             => $customer->id,
                'order_status_id'         => $status->id,
                'montant'                 => $data['montant'],
                'order_payment_status_id' => $data['payment']->id,
                'payment_method'          => 'wave',
                'address'                 => 'Dakar, Almadies',
                'created_at'              => $createdAt,
                'updated_at'              => $createdAt,
            ]);

            // Create order history
            OrderHistory::create([
                'order_id'        => $order->id,
                'order_status_id' => $status->id,
                'created_at'      => $createdAt,
            ]);

            $created++;
        }

        $this->command->info("Test orders created: {$created} new (Total: " . Order::count() . ")");
    }

    /**
     * Set promotional prices on some BoxTypes and Slices.
     */
    private function setPromotionalPrices()
    {
        // Set promo on 2 box types
        $boxTypes = BoxType::take(2)->get();
        foreach ($boxTypes as $i => $bt) {
            $promoPrice = round($bt->price * ($i === 0 ? 0.8 : 0.85)); // 20% or 15% off
            $bt->update([
                'promotional_price'    => $promoPrice,
                'promotion_starts_at'  => Carbon::now()->subDays(2),
                'promotion_ends_at'    => Carbon::now()->addDays(14),
            ]);
        }
        $this->command->info("Promotional prices set on {$boxTypes->count()} box types");

        // Set promo on 5 slices
        $slices = Slice::take(5)->get();
        foreach ($slices as $i => $slice) {
            $discount = 0.75 + ($i * 0.03); // 25%, 22%, 19%, 16%, 13% off
            $promoPrice = round($slice->price * $discount);
            $slice->update([
                'promotional_price'    => $promoPrice,
                'promotion_starts_at'  => Carbon::now()->subDays(1),
                'promotion_ends_at'    => Carbon::now()->addDays(21),
            ]);
        }
        $this->command->info("Promotional prices set on {$slices->count()} slices");
    }
}
