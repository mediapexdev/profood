<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;

/**
 * 
 */
class SuperAdminController extends Controller
{
    /**
     * Get super admin by a given id.
     *
     * @param  integer  $super_admin_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuperAdmin($super_admin_id)
    {
        $super_admin = SuperAdmin::find($super_admin_id);

        if(!isset($super_admin)){
            return response()->json(['message' => 'Super administrateur introuvable !'], 404);
        }
        return response()->json($super_admin, 200);
    }

    /**
     * Get super admin by a given user id.
     *
     * @param  integer  $user_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuperAdminByUserId($user_id)
    {
        $super_admin = SuperAdmin::where('user_id', $user_id)->first();

        if(!isset($super_admin)){
            return response()->json(['message' => 'Super administrateur introuvable !'], 404);
        }
        return response()->json($super_admin, 200);
    }

    /**
     * Get all super admins.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuperAdmins()
    {
        $super_admins = SuperAdmin::all();

        return response()->json($super_admins, 200);
    }

    /**
     * get all super admins with their linked users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuperAdminsWithLinkedUsers()
    {
        $super_admins = SuperAdmin::with('user')->orderBy('created_at')->get();

        return response()->json($super_admins, 200);
    }
}
