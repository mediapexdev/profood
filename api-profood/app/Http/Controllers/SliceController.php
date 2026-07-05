<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteResourceRequest;
use App\Http\Requests\StoreSliceRequest;
use App\Http\Requests\UpdateSliceRequest;
use App\Models\Slice;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Services\ImageService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * 
 */
class SliceController extends Controller
{
    /**
     * Add a new slice.
     *
     * @param  \App\Http\Requests\StoreSliceRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSlice(StoreSliceRequest $request)
    {
        // Validation and authorization are automatically handled by StoreSliceRequest

        $s_illustration = null;

        if(!$request->hasFile('illustration')){
            return response()->json(['message' => "Veuillez choisir une image d'illustration"], 422);
        }
        $illustration = $request->file('illustration');
        $imageService = new ImageService();
        $s_illustration = $imageService->processToDisk($illustration, 'slices', 256, 256);

        $slice = Slice::create([
            'wording'              => Str::of($request->wording)->stripTags()->trim()->ucfirst(),
            'category_id'          => (int)Str::of($request->category_id)->stripTags()->trim(),
            'price'                => Str::of($request->price)->stripTags()->trim(),
            'weight'               => Str::of($request->weight)->stripTags()->trim(),
            'available_in_box'     => $request->available_in_box,
            'illustration'         => $s_illustration,
            // Promotional price fields
            'promotional_price'    => $request->promotional_price ? Str::of($request->promotional_price)->stripTags()->trim() : null,
            'promotion_starts_at'  => $request->promotion_starts_at,
            'promotion_ends_at'    => $request->promotion_ends_at,
            // Inventory: null means the product is not tracked (unlimited).
            'stock_quantity'       => $request->filled('stock_quantity') ? (int)Str::of($request->stock_quantity)->stripTags()->trim() : null,
            'low_stock_threshold'  => $request->filled('low_stock_threshold') ? (int)Str::of($request->low_stock_threshold)->stripTags()->trim() : null,
        ]);
        return response()->json(['message' => 'Produit créé !', 'slice' => $slice], 200); 
    }

    /**
     * Update a slice.
     *
     * @param  \App\Http\Requests\UpdateSliceRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSlice(UpdateSliceRequest $request)
    {
        // Validation and authorization are automatically handled by UpdateSliceRequest

        $slice = Slice::find($request->id);

        if(!isset($slice)){
            return response()->json(['message' => 'Produit inexistant !'], 404);
        }

        $changes_made = false;

        if((int)$request->category_id != (int)$slice->category_id){
            $slice->category_id = (int)Str::of($request->category_id)->stripTags()->trim();
            $changes_made = true;
        }
        if(0 != \strcmp($request->price, $slice->price)){
            $slice->price = Str::of($request->price)->stripTags()->trim();
            $changes_made = true;
        }
        if(0 != \strcmp($request->weight, $slice->weight)){
            $slice->weight = Str::of($request->weight)->stripTags()->trim();
            $changes_made = true;
        }
        if((int)$request->available_in_box != (int)$slice->available_in_box){
            $slice->available_in_box = (int)Str::of($request->available_in_box)->stripTags()->trim();
            $changes_made = true;
        }
        if(0 != \strcmp($request->wording, $slice->wording)) {

            $validator = Validator::make($request->all(), [
                'wording' => ['unique:slices']
            ]);
            if($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }
            // Mis à jour du libellé

            $slice->wording = Str::of($request->wording)->stripTags()->trim()->ucfirst();
            $changes_made = true;
        }

        // Handle promotional price fields
        $newPromoPrice = $request->promotional_price ? (float)$request->promotional_price : null;
        $currentPromoPrice = $slice->promotional_price ? (float)$slice->promotional_price : null;
        if($newPromoPrice !== $currentPromoPrice) {
            $slice->promotional_price = $newPromoPrice;
            $changes_made = true;
        }

        $newStartsAt = $request->promotion_starts_at;
        $currentStartsAt = $slice->promotion_starts_at ? $slice->promotion_starts_at->toDateTimeString() : null;
        if($newStartsAt != $currentStartsAt) {
            $slice->promotion_starts_at = $newStartsAt;
            $changes_made = true;
        }

        $newEndsAt = $request->promotion_ends_at;
        $currentEndsAt = $slice->promotion_ends_at ? $slice->promotion_ends_at->toDateTimeString() : null;
        if($newEndsAt != $currentEndsAt) {
            $slice->promotion_ends_at = $newEndsAt;
            $changes_made = true;
        }

        // Inventory fields — null means the product is not tracked (unlimited).
        $newStock = $request->filled('stock_quantity') ? (int)$request->stock_quantity : null;
        $currentStock = $slice->stock_quantity !== null ? (int)$slice->stock_quantity : null;
        if($newStock !== $currentStock) {
            $slice->stock_quantity = $newStock;
            $changes_made = true;
        }

        $newThreshold = $request->filled('low_stock_threshold') ? (int)$request->low_stock_threshold : null;
        $currentThreshold = $slice->low_stock_threshold !== null ? (int)$slice->low_stock_threshold : null;
        if($newThreshold !== $currentThreshold) {
            $slice->low_stock_threshold = $newThreshold;
            $changes_made = true;
        }

        if($request->hasFile('illustration')) {
            $illustration = $request->file('illustration');
            $imageService = new ImageService();
            $s_illustration = $imageService->processToDisk($illustration, 'slices', 256, 256);

            // Mis à jour de l'image d'illustration

            $slice->illustration = $s_illustration;
            $changes_made = true;
        }
        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée !'], 204); 
        }
        $slice->save();

        return response()->json(['message' => 'Produit mis à jour !', 'slice' => $slice], 200); 
    }

    /**
     * Delete a slice.
     *
     * @param  \App\Http\Requests\DeleteResourceRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSlice(DeleteResourceRequest $request)
    {
        // Validation and authorization are automatically handled by DeleteResourceRequest

        $user = User::find(Auth::user()->id);

        if(!isset($user)){
            return response()->json(['message' => 'Non autorisé !'], 401);
        }

        // Verify password for security
        if(!Hash::check($request['password'], $user->password)){
            return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        }

        $slice = Slice::find($request->id);

        if(!isset($slice)){
            return response()->json(['message' => 'Produit inexistant !'], 404);
        }
        $slice->delete();

        return response()->json(['message' => 'Produit supprimé !'], 200);
    }

    /**
     * Get slice by a given id.
     *
     * @param  integer  $slice_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlice($slice_id)
    {
        $slice = Slice::find($slice_id);

        if(!isset($slice)){
            return response()->json(['message' => 'Produit inexistant !'], 404);
        }
        return response()->json($slice, 200);
    }

    /**
     * Get all slices.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlices(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // This prevents performance degradation when product catalog grows large
        $perPage = min($request->input('per_page', 20), 100);

        $slices = Slice::with('category')->orderBy('wording')->paginate($perPage);

        return response()->json($slices, 200);
    }

    /**
     * Get slices by a given category id.
     *
     * @param  integer  $category_id
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlicesByCategory($category_id, Request $request)
    {
        if(!Category::find($category_id)){
            return response()->json(['message' => 'Catégorie inexistante !'], 404);
        }

        // Calculate per_page with a default of 20 and maximum of 100
        // Pagination ensures efficient queries even when categories have many products
        $perPage = min($request->input('per_page', 20), 100);

        $slices = Slice::where('category_id', $category_id)->orderBy('wording')->paginate($perPage);

        return response()->json($slices, 200);
    }

    /**
     * Get all slices present in box types.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlicesAvailableInBox(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // Pagination improves response time for large product inventories
        $perPage = min($request->input('per_page', 20), 100);

        $slices = Slice::where('available_in_box', true)->with('category')->orderBy('wording')->paginate($perPage);

        return response()->json($slices, 200);
    }
}
