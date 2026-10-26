<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Les rôles ne venaient que de RoleSeeder, jamais exécuté en production :
     * sans ligne Livreur, le manager ne peut créer aucun livreur.
     * Crée aussi le compte livreur de démo des stores si le .env le fournit.
     */
    public function up()
    {
        $role = DB::table('roles')->where('code', Role::LIVREUR)->first();
        $roleId = $role->id ?? DB::table('roles')->insertGetId([
            'wording'    => 'Livreur',
            'code'       => Role::LIVREUR,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $phone = preg_replace('/\s+/', '', (string) config('services.livreur_demo.phone_number'));
        $password = (string) config('services.livreur_demo.password');
        if ($phone === '' || $password === '' || DB::table('users')->where('phone_number', $phone)->exists()) {
            return;
        }
        $userId = DB::table('users')->insertGetId([
            'first_name'    => 'Livreur',
            'last_name'     => 'Démo',
            'phone_number'  => $phone,
            'email'         => null,
            'password'      => Hash::make($password),
            'role_id'       => $roleId,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
        DB::table('livreurs')->insert([
            'user_id'    => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Pas de suppression : des utilisateurs peuvent déjà porter ce rôle.
     */
    public function down()
    {
    }
};
