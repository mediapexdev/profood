<?php

namespace Database\Seeders;

use App\Models\OrderStatus;
use Illuminate\Database\Seeder;

/**
 * 
 */
class OrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        OrderStatus::truncate();

        $statuses = [
            ["Awaiting processing", OrderStatus::AWAITING_PROCESSING],
            ["Being processed", OrderStatus::BEING_PROCESSED],
            ["In the process of delivery", OrderStatus::IN_THE_PROCESS_OF_DELIVERY],
            ["Delivered", OrderStatus::DELIVERED],
            ["Cancelled", OrderStatus::CANCELLED]
        ];

        foreach ($statuses as $status) {
            OrderStatus::create([
                'wording'   => $status[0],
                'code'      => $status[1]
            ]);
        }
    }
}
