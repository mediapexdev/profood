<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Admin;

/**
 * 
 */
class AdminController extends Controller
{
    /**
     * Get admin by a given id.
     *
     * @param  integer  $admin_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdmin($admin_id)
    {
        $admin = Admin::find($admin_id);

        if(!$admin){
            return response()->json(['message' => 'Administrateur introuvable !'], 404);
        }
        return response()->json($admin, 200);
    }

    /**
     * Get admin by a given user id.
     *
     * @param  integer  $user_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdminByUserId($user_id)
    {
        $admin = Admin::where('user_id', $user_id)->first();

        if(!$admin){
            return response()->json(['message' => 'Administrateur introuvable !'], 404);
        }
        return response()->json($admin, 200);
    }

    /**
     * Get all admins.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdmins()
    {
        $admins = Admin::all();

        return response()->json($admins, 200);
    }

    /**
     * get all admins with their linked users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAdminsWithLinkedUsers()
    {
        $admins = Admin::with('user')->orderBy('created_at')->get();

        return response()->json($admins, 200);
    }
}
