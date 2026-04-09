<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Customer;
use App\Models\User;
use App\Models\Manager;
use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;

/**
 * 
 */
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Customer::truncate();
        Manager::truncate();
        Admin::truncate();
        SuperAdmin::truncate();
        User::truncate();

        $password = \bcrypt(12345678);
        $users = [
            [
                "first_name"    => "Abdoul Aziz",
                "last_name"     => "Thioye",
                "phone_number"  => "775025252",
                'email'         => 'zizdev22@gmail.com',
                "password"      => $password,
                "role_id"       => 4,
                "active"        => true,
                "logged"        => false,
                "session_count" => 0
            ],
            [
                "first_name"    => "Abdoul Aziz",
                "last_name"     => "Thioye",
                "phone_number"  => "785025252",
                'email'         => 'zizdev24@gmail.com',
                "password"      => $password,
                "role_id"       => 1,
                "active"        => true,
                "logged"        => false,
                "session_count" => 0
            ],
            [
                "first_name"    => "Abdoul Aziz",
                "last_name"     => "Thioye",
                "phone_number"  => "765025252",
                'email'         => 'aziz922010@gmail.com',
                "password"      => $password,
                "role_id"       => 2,
                "active"        => true,
                "logged"        => false,
                "session_count" => 0
            ],
            [
                "first_name"    => "Yoro",
                "last_name"     => "Diop",
                "phone_number"  => "775151656",
                'email'         => 'yoro.diop@mediapex.net',
                "password"      => $password,
                "role_id"       => 2,
                "active"        => true,
                "logged"        => false,
                "session_count" => 0
            ]
        ];
        foreach ($users as $user) {
            $created_user = User::create($user);

            switch($user['role_id']) {
                case 1:
                    Admin::create([
                        'user_id' => $created_user->id
                    ]);
                    break;
                case 2:
                    Customer::create([
                        'user_id' => $created_user->id
                    ]);
                    break;
                case 3:
                    Manager::create([
                        'user_id' => $created_user->id,
                    ]);
                    break;
                case 4:
                    SuperAdmin::create([
                        'user_id' => $created_user->id,
                    ]);
                    break;
                default:
                    break;
            }
        }
    }
}
