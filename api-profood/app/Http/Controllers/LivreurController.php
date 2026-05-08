<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderStatus;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class LivreurController extends Controller
{
    /**
     * Return the livreur entity for the currently authenticated user.
     */
    public function show()
    {
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        return response()->json($livreur->load('user'), 200);
    }

    /**
     * Return all orders assigned to the current livreur, most recent first.
     */
    public function getDeliveries()
    {
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $orders = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status')
            ->where('livreur_id', $livreur->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders, 200);
    }

    /**
     * Return a single order assigned to the current livreur.
     */
    public function getDelivery($id)
    {
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $order = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status')
            ->where('id', (int)$id)
            ->where('livreur_id', $livreur->id)
            ->first();

        if(!isset($order)){
            return response()->json(['message' => 'Commande introuvable ou non assignée'], 404);
        }
        return response()->json($order, 200);
    }

    /**
     * Update the status of an order assigned to the current livreur.
     * The livreur can only set the status to IN_THE_PROCESS_OF_DELIVERY,
     * DELIVERED, or CANCELLED.
     */
    public function updateDeliveryStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id'  => ['required', 'integer'],
            'status_id' => ['required', 'integer']
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $order = Order::where('id', (int)$request->order_id)
            ->where('livreur_id', $livreur->id)
            ->first();

        if(!isset($order)){
            return response()->json(['message' => 'Commande introuvable ou non assignée'], 404);
        }
        $status = OrderStatus::find((int)$request->status_id);

        if(!isset($status)){
            return response()->json(['message' => 'Statut inexistant'], 404);
        }
        $allowed = [
            OrderStatus::IN_THE_PROCESS_OF_DELIVERY,
            OrderStatus::DELIVERED,
            OrderStatus::CANCELLED
        ];
        if(!in_array($status->code, $allowed, true)){
            return response()->json(['message' => 'Transition de statut interdite pour un livreur'], 403);
        }
        $cond = [
            'order_id'          => $order->id,
            'order_status_id'   => $status->id
        ];
        if(!OrderHistory::where($cond)->exists()){
            OrderHistory::create($cond);
        }
        $order->order_status_id = $status->id;
        $order->save();

        Log::info('Order status updated by livreur', [
            'order_id'   => $order->id,
            'order_ref'  => $order->string_id,
            'new_status' => $status->code,
            'livreur_id' => $livreur->id,
            'action'     => 'livreur:updateDeliveryStatus'
        ]);

        return response()->json([
            'message'  => 'Statut de la commande mis à jour',
            'order_id' => $order->id,
            'status'   => $status
        ], 200);
    }

    /**
     * List all livreurs (with their user). Admin/Manager scope.
     */
    public function index()
    {
        if(!$this->isManagerScope()){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $livreurs = Livreur::with('user')->get();

        return response()->json($livreurs, 200);
    }

    /**
     * Assign a livreur to an order. Admin/Manager scope.
     * Pass livreur_id = null to unassign.
     */
    public function assignToOrder(Request $request)
    {
        if(!$this->isManagerScope()){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $validator = Validator::make($request->all(), [
            'order_id'   => ['required', 'integer'],
            'livreur_id' => ['nullable', 'integer']
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $order = Order::find((int)$request->order_id);

        if(!isset($order)){
            return response()->json(['message' => 'Commande inexistante'], 404);
        }
        if($request->livreur_id !== null){
            $livreur = Livreur::find((int)$request->livreur_id);

            if(!isset($livreur)){
                return response()->json(['message' => 'Livreur inexistant'], 404);
            }
            $order->livreur_id = $livreur->id;
        }
        else{
            $order->livreur_id = null;
        }
        $order->save();

        Log::info('Livreur assigned to order', [
            'order_id'   => $order->id,
            'livreur_id' => $order->livreur_id,
            'manager_id' => Auth::id(),
            'action'     => 'livreur:assignToOrder'
        ]);

        return response()->json([
            'message'    => $order->livreur_id ? 'Livreur assigné à la commande' : 'Livreur retiré de la commande',
            'order_id'   => $order->id,
            'livreur_id' => $order->livreur_id
        ], 200);
    }

    protected function isManagerScope(): bool
    {
        $user = Auth::user();
        if(!isset($user)) return false;
        return in_array($user->role->code, [Role::ADMIN, Role::MANAGER, Role::SUPER_ADMIN], true);
    }

    /**
     * Resolve the Livreur entity bound to the authenticated user, or
     * return a JsonResponse explaining why the request is rejected.
     *
     * @return \App\Models\Livreur|\Illuminate\Http\JsonResponse
     */
    protected function currentLivreur()
    {
        $user = Auth::user();

        if(!isset($user)){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
        if($user->role->code != Role::LIVREUR){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $livreur = Livreur::where('user_id', $user->id)->first();

        if(!isset($livreur)){
            return response()->json(['message' => 'Profil livreur introuvable'], 404);
        }
        return $livreur;
    }
}
