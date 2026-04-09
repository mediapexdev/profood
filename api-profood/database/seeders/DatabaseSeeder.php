<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\ArrondissementSeeder;
use Database\Seeders\BoxTypeSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\CommuneSeeder;
use Database\Seeders\DepartementSeeder;
use Database\Seeders\LocaliteSeeder;
use Database\Seeders\OrderPaymentStatusSeeder;
use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SliceSeeder;
// use Database\Seeders\UserSeeder;

/**
 * 
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);

        $this->call(SliceSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(BoxTypeSeeder::class);
        $this->call(OrderStatusSeeder::class);
        $this->call(OrderPaymentStatusSeeder::class);

        $this->call(DepartementSeeder::class);
        $this->call(ArrondissementSeeder::class);
        $this->call(CommuneSeeder::class);
        $this->call(LocaliteSeeder::class);
    }
}
