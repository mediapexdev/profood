<?php

namespace Database\Seeders;

use App\Models\OrderPaymentStatus;
use Illuminate\Database\Seeder;

/**
 * 
 */
class OrderPaymentStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        OrderPaymentStatus::truncate();

        $statuses = [
            ["Payée", OrderPaymentStatus::PAID],
            ["Non payée", OrderPaymentStatus::UNPAID]
        ];
        foreach ($statuses as $status) {
            OrderPaymentStatus::create([
                'wording'   => $status[0],
                'code'      => $status[1]
            ]);
        }
    }
}
