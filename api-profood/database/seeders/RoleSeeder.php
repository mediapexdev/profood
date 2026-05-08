<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * 
 */
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Role::truncate();

        $roles = [
            ["Admin", Role::ADMIN],
            ["Customer", Role::CUSTOMER],
            ["Livreur", Role::LIVREUR],
            ["Manager", Role::MANAGER],
            ["Super Admin", Role::SUPER_ADMIN]
        ];

        foreach ($roles as $role) {
            Role::create([
                'wording'   => $role[0],
                'code'      => $role[1]
            ]);
        }
    }
}
