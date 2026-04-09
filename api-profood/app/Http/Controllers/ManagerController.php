<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Manager;

/**
 * 
 */
class ManagerController extends Controller
{
    /**
     * Get manager by a given id.
     *
     * @param  integer  $manager_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManager($manager_id)
    {
        $manager = Manager::find($manager_id);

        if(!isset($manager)){
            return response()->json(['message' => 'Gestionnaire introuvable !'], 404);
        }
        return response()->json($manager, 200);
    }

    /**
     * Get manager by a given user id.
     *
     * @param  integer  $user_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManagerByUserId($user_id)
    {
        $manager = Manager::where('user_id', $user_id)->first();

        if(!isset($manager)){
            return response()->json(['message' => 'Gestionnaire introuvable !'], 404);
        }
        return response()->json($manager, 200);
    }

    /**
     * Get all managers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManagers()
    {
        $managers = Manager::all();

        return response()->json($managers, 200);
    }

    /**
     * get all managers with their linked users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManagersWithLinkedUsers()
    {
        $managers = Manager::with('user')->orderBy('created_at')->get();

        return response()->json($managers, 200);
    }
}
