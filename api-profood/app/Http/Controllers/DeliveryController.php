<?php

namespace App\Http\Controllers;

use App\Models\Commune;
use App\Models\DeliverySettings;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Delivery pricing: a public fee quote for the storefront, and staff-only
 * configuration of the global settings and per-zone (commune) fees.
 */
class DeliveryController extends Controller
{
    /**
     * Whether the authenticated caller is staff (manager/admin/super admin).
     */
    private function isStaff(): bool
    {
        $user = User::with('role')->find(Auth::user()->getAuthIdentifier());

        return $user !== null && in_array((int) optional($user->role)->code, [
            Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN,
        ], true);
    }

    /**
     * Public: quote the delivery fee for a locality and an order subtotal.
     * Used by the storefront to show the fee before checkout.
     */
    public function quoteDeliveryFee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'localite_id' => ['nullable', 'integer', 'exists:localites,id'],
            'subtotal'    => ['nullable', 'numeric', 'min:0'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $localiteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
        $subtotal = (float) $request->input('subtotal', 0);

        $settings = DeliverySettings::current();
        $fee = DeliverySettings::resolveFee($localiteId, $subtotal);

        return response()->json([
            'delivery_fee'            => $fee,
            'free_shipping_threshold' => $settings->free_shipping_threshold,
            'free_shipping_applied'   => $fee === 0
                && $settings->free_shipping_threshold !== null
                && $subtotal >= $settings->free_shipping_threshold,
        ], 200);
    }

    /**
     * Staff: current global delivery settings.
     */
    public function getDeliverySettings()
    {
        if (!$this->isStaff()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return response()->json(['settings' => DeliverySettings::current()], 200);
    }

    /**
     * Staff: update the global delivery settings.
     */
    public function updateDeliverySettings(Request $request)
    {
        if (!$this->isStaff()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'default_fee'             => ['required', 'integer', 'min:0'],
            'free_shipping_threshold' => ['nullable', 'integer', 'min:0'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $settings = DeliverySettings::current();
        $settings->default_fee = (int) $request->default_fee;
        $settings->free_shipping_threshold = $request->filled('free_shipping_threshold')
            ? (int) $request->free_shipping_threshold
            : null;
        $settings->save();

        return response()->json(['message' => 'Paramètres de livraison mis à jour', 'settings' => $settings], 200);
    }

    /**
     * Staff: delivery zones (communes) with their fees. Optional `q` search on
     * the commune name, paginated.
     */
    public function getDeliveryZones(Request $request)
    {
        if (!$this->isStaff()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $perPage = min(100, max(1, (int) $request->input('per_page', 30)));
        $query = Commune::with('departement')->orderBy('wording');

        if ($request->filled('q')) {
            $query->where('wording', 'like', '%' . $request->q . '%');
        }

        return response()->json([
            'default_fee' => DeliverySettings::current()->default_fee,
            'zones'       => $query->paginate($perPage),
        ], 200);
    }

    /**
     * Staff: set (or clear) a commune's delivery fee. A null fee means the
     * commune falls back to the global default.
     */
    public function updateCommuneFee(Request $request)
    {
        if (!$this->isStaff()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'commune_id'   => ['required', 'integer', 'exists:communes,id'],
            'delivery_fee' => ['nullable', 'integer', 'min:0'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $commune = Commune::find($request->commune_id);
        $commune->delivery_fee = $request->filled('delivery_fee') ? (int) $request->delivery_fee : null;
        $commune->save();

        return response()->json(['message' => 'Tarif de zone mis à jour', 'zone' => $commune], 200);
    }
}
