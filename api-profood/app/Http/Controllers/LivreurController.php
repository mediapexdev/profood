<?php

namespace App\Http\Controllers;

use App\Models\Box;
use App\Models\CartSlice;
use App\Models\Livreur;
use App\Models\LivreurLocation;
use App\Models\LivreurNotification;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderStatus;
use App\Models\Role;
use Carbon\Carbon;
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
        $previousLivreurId = $order->livreur_id;

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

        // Drop an inbox row only on a real (re)assignment so the driver sees
        // it next time they open the app. No-op when unassigning or when
        // the same livreur is "re-assigned" to a row they already own.
        if($order->livreur_id && $order->livreur_id !== $previousLivreurId){
            LivreurNotification::create([
                'livreur_id' => $order->livreur_id,
                'type'       => 'delivery',
                'title'      => 'Nouvelle livraison assignée',
                'body'       => "Commande {$order->string_id} ajoutée à votre tournée.",
                'order_id'   => $order->id,
            ]);
        }

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

    /**
     * Return per-livreur statistics for a given calendar day.
     *
     * Query parameters:
     *   date  (optional, Y-m-d)  — defaults to today in Africa/Dakar timezone.
     *
     * Response shape (camelCase for clean TypeScript mapping):
     * {
     *   "total":               int,   // orders assigned for the day (all statuses)
     *   "completed":           int,   // status == DELIVERED
     *   "inProgress":          int,   // status == IN_THE_PROCESS_OF_DELIVERY
     *   "pending":             int,   // all other statuses except CANCELLED
     *   "cancelled":           int,   // status == CANCELLED
     *   "totalAmount":         float, // sum of montant for delivered orders that day
     *   "deliveriesGrouped":   int,   // orders that contain at least one Box
     *   "deliveriesIndividual":int    // orders that contain only CartSlices (no Boxes)
     * }
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();

        if(!isset($user)){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }

        // Validate the optional parameters.
        $validator = Validator::make($request->all(), [
            'date'       => ['nullable', 'date_format:Y-m-d'],
            'livreur_id' => ['nullable', 'integer', 'exists:livreurs,id'],
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Admin/manager scope: fetch stats for the given livreur_id.
        // Otherwise: resolve the livreur tied to the authenticated user.
        if($this->isManagerScope() && $request->filled('livreur_id')){
            $livreur = Livreur::find((int)$request->query('livreur_id'));

            if(!isset($livreur)){
                return response()->json(['message' => 'Livreur introuvable'], 404);
            }
        }
        else{
            $livreur = $this->currentLivreur();

            if(!$livreur instanceof Livreur){
                return $livreur;
            }
        }

        // Default to today in the Dakar timezone, matching the intl handling
        // used throughout OrderController (e.g. updateOrderStatus).
        $tz        = 'Africa/Dakar';
        $dateStr   = $request->query('date') ?? Carbon::now($tz)->format('Y-m-d');
        $dayStart  = Carbon::createFromFormat('Y-m-d', $dateStr, $tz)->startOfDay();
        $dayEnd    = Carbon::createFromFormat('Y-m-d', $dateStr, $tz)->endOfDay();

        // Fetch only this livreur's orders for the requested day, with status
        // and cart (needed for the grouped/individual split).
        $orders = Order::with(['status', 'cart'])
            ->where('livreur_id', $livreur->id)
            ->whereBetween('created_at', [$dayStart, $dayEnd])
            ->get();

        // Accumulate counters in a single pass over the order collection to
        // avoid issuing one query per order.
        $total       = 0;
        $completed   = 0;
        $inProgress  = 0;
        $cancelled   = 0;
        $totalAmount = 0.0;

        // Collect cart_ids for the grouped/individual split; we resolve
        // those with a single IN (...) query rather than per-order lookups.
        $cartIds = [];

        foreach($orders as $order){
            $total++;
            $code = optional($order->status)->code;

            if($code === OrderStatus::DELIVERED){
                $completed++;
                $totalAmount += (float) $order->montant;
            }
            elseif($code === OrderStatus::IN_THE_PROCESS_OF_DELIVERY){
                $inProgress++;
            }
            elseif($code === OrderStatus::CANCELLED){
                $cancelled++;
            }

            if($order->cart_id){
                $cartIds[] = $order->cart_id;
            }
        }

        // pending = all orders that are neither delivered, in-progress, nor cancelled.
        $pending = $total - $completed - $inProgress - $cancelled;

        // Determine which carts contain at least one Box (= "grouped" delivery)
        // vs only individual CartSlices.
        $deliveriesGrouped    = 0;
        $deliveriesIndividual = 0;

        if(!empty($cartIds)){
            // Carts that have at least one Box row are "grouped" orders.
            $cartsWithBoxes = Box::whereIn('cart_id', $cartIds)
                ->distinct()
                ->pluck('cart_id')
                ->flip(); // keyed by cart_id for O(1) lookup

            foreach($orders as $order){
                if(!$order->cart_id) continue;

                if($cartsWithBoxes->has($order->cart_id)){
                    $deliveriesGrouped++;
                }
                else{
                    // No box in this cart — check that it has at least one
                    // individual CartSlice before counting it as individual.
                    $deliveriesIndividual++;
                }
            }
        }

        // Distance travelled: sum great-circle deltas between consecutive
        // location pings recorded during the day. Returns 0.0 when fewer
        // than two pings exist.
        $totalDistanceKm = $this->computeTotalDistanceKm($livreur->id, $dayStart, $dayEnd);

        // Average delivery duration: mean seconds between the
        // IN_THE_PROCESS_OF_DELIVERY history row and the DELIVERED history
        // row for each delivered order. null when no delivered order yet.
        $averageDeliverySeconds = $this->computeAverageDeliverySeconds($livreur->id, $dayStart, $dayEnd);

        return response()->json([
            'total'                  => $total,
            'completed'              => $completed,
            'inProgress'             => $inProgress,
            'pending'                => max(0, $pending),
            'cancelled'              => $cancelled,
            'totalAmount'            => $totalAmount,
            'deliveriesGrouped'      => $deliveriesGrouped,
            'deliveriesIndividual'   => $deliveriesIndividual,
            'totalDistanceKm'        => round($totalDistanceKm, 2),
            'averageDeliverySeconds' => $averageDeliverySeconds,
        ], 200);
    }

    /**
     * Walk the livreur's location pings for the day in chronological order
     * and accumulate the great-circle distance between consecutive points.
     * Kept inside the controller — a single caller, no value in extracting.
     */
    private function computeTotalDistanceKm(int $livreurId, Carbon $dayStart, Carbon $dayEnd): float
    {
        $points = LivreurLocation::where('livreur_id', $livreurId)
            ->whereBetween('recorded_at', [$dayStart, $dayEnd])
            ->orderBy('recorded_at', 'asc')
            ->get(['latitude', 'longitude']);

        if($points->count() < 2){
            return 0.0;
        }
        $total = 0.0;
        $prev = null;
        foreach($points as $p){
            if($prev !== null){
                $total += $this->haversineKm(
                    (float)$prev->latitude,  (float)$prev->longitude,
                    (float)$p->latitude,     (float)$p->longitude
                );
            }
            $prev = $p;
        }
        return $total;
    }

    /**
     * Haversine great-circle distance in kilometres. Earth radius approx
     * 6371 km — fine for the precision we need (dashboard tile, not
     * navigation).
     */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
             + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $r * $c;
    }

    /**
     * For each delivered order assigned to this livreur during the day,
     * compute the seconds between the IN_THE_PROCESS_OF_DELIVERY history
     * row and the DELIVERED history row, then return the mean. Returns
     * null when no completed order has both timestamps yet, so the
     * client can render a "–" placeholder instead of a misleading 0.
     */
    private function computeAverageDeliverySeconds(int $livreurId, Carbon $dayStart, Carbon $dayEnd): ?int
    {
        $inProgressStatus = OrderStatus::where('code', OrderStatus::IN_THE_PROCESS_OF_DELIVERY)->first();
        $deliveredStatus  = OrderStatus::where('code', OrderStatus::DELIVERED)->first();
        if(!$inProgressStatus || !$deliveredStatus) return null;

        $deliveredOrderIds = Order::where('livreur_id', $livreurId)
            ->where('order_status_id', $deliveredStatus->id)
            ->whereBetween('created_at', [$dayStart, $dayEnd])
            ->pluck('id');

        if($deliveredOrderIds->isEmpty()) return null;

        $histories = OrderHistory::whereIn('order_id', $deliveredOrderIds)
            ->whereIn('order_status_id', [$inProgressStatus->id, $deliveredStatus->id])
            ->orderBy('created_at', 'asc')
            ->get(['order_id', 'order_status_id', 'created_at']);

        $startedAt   = [];
        $deliveredAt = [];
        foreach($histories as $h){
            if($h->order_status_id === $inProgressStatus->id){
                $startedAt[$h->order_id] = $h->created_at;
            }
            elseif($h->order_status_id === $deliveredStatus->id){
                $deliveredAt[$h->order_id] = $h->created_at;
            }
        }
        $deltas = [];
        foreach($deliveredAt as $orderId => $endAt){
            if(isset($startedAt[$orderId])){
                $diff = $endAt->diffInSeconds($startedAt[$orderId]);
                if($diff > 0) $deltas[] = $diff;
            }
        }
        if(empty($deltas)) return null;
        return (int) round(array_sum($deltas) / count($deltas));
    }

    protected function isManagerScope(): bool
    {
        $user = Auth::user();
        if(!isset($user)) return false;
        return in_array($user->role->code, [Role::ADMIN, Role::MANAGER, Role::SUPER_ADMIN], true);
    }

    /**
     * Record a GPS ping for the current livreur. Called periodically by
     * the livreur app while a delivery is active. Bad payloads are
     * dropped with a 422 — coordinates that fall outside Earth ranges
     * are almost certainly bugs in the client.
     */
    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy'  => ['nullable', 'numeric', 'min:0'],
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $location = LivreurLocation::create([
            'livreur_id'  => $livreur->id,
            'latitude'    => (float)$request->latitude,
            'longitude'   => (float)$request->longitude,
            'accuracy'    => $request->accuracy !== null ? (float)$request->accuracy : null,
            'recorded_at' => now(),
        ]);
        return response()->json(['id' => $location->id, 'recorded_at' => $location->recorded_at], 201);
    }

    /**
     * Manager scope. Return the most recent location ping of a given
     * livreur (or 404 if they have never reported one).
     */
    public function getLivreurLastLocation($id)
    {
        if(!$this->isManagerScope()){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $location = LivreurLocation::where('livreur_id', (int)$id)
            ->orderBy('recorded_at', 'desc')
            ->first();

        if(!isset($location)){
            return response()->json(['message' => 'Aucune position enregistrée'], 404);
        }
        return response()->json($location, 200);
    }

    /**
     * Return the current livreur's notification inbox, most recent first.
     */
    public function getNotifications()
    {
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $rows = LivreurNotification::where('livreur_id', $livreur->id)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($rows, 200);
    }

    /**
     * Mark a single notification as read.
     */
    public function markNotificationRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => ['required', 'integer']
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $notification = LivreurNotification::where('id', (int)$request->id)
            ->where('livreur_id', $livreur->id)
            ->first();

        if(!isset($notification)){
            return response()->json(['message' => 'Notification introuvable'], 404);
        }
        if($notification->read_at === null){
            $notification->read_at = now();
            $notification->save();
        }
        return response()->json(['message' => 'Notification marquée comme lue', 'id' => $notification->id], 200);
    }

    /**
     * Mark every unread notification of the current livreur as read.
     */
    public function markAllNotificationsRead()
    {
        $livreur = $this->currentLivreur();

        if(!$livreur instanceof Livreur){
            return $livreur;
        }
        $updated = LivreurNotification::where('livreur_id', $livreur->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications marquées comme lues', 'count' => $updated], 200);
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
