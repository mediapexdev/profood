<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteResourceRequest;
use App\Http\Requests\StoreBoxTypeRequest;
use App\Http\Requests\UpdateBoxTypeRequest;
use App\Models\BoxType;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Services\ImageService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * 
 */
class BoxTypeController extends Controller
{
    /**
     * Add a new box type.
     *
     * @param  \App\Http\Requests\StoreBoxTypeRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addBoxType(StoreBoxTypeRequest $request)
    {
        // Validation and authorization are automatically handled by StoreBoxTypeRequest

        $bt_illustration = null;

        if(!$request->hasFile('illustration')){
            return response()->json(['message' => "Veuillez choisir une image d'illustration"], 422);
        }
        $illustration = $request->file('illustration');
        $imageService = new ImageService();
        $bt_illustration = $imageService->processToBase64($illustration, 256, 256);

        $box = BoxType::create([
            'wording'              => Str::of($request->wording)->stripTags()->trim()->ucfirst(),
            'capacity'             => Str::of($request->capacity)->stripTags()->trim(),
            'price'                => Str::of($request->price)->stripTags()->trim(),
            'illustration'         => $bt_illustration,
            // Promotional price fields
            'promotional_price'    => $request->promotional_price ? Str::of($request->promotional_price)->stripTags()->trim() : null,
            'promotion_starts_at'  => $request->promotion_starts_at,
            'promotion_ends_at'    => $request->promotion_ends_at,
        ]);

        // Log successful box type creation
        Log::info('Box type created successfully', [
            'user_id' => Auth::id(),
            'box_type_id' => $box->id,
            'wording' => $box->wording,
            'price' => $box->price,
            'action' => 'addBoxType'
        ]);

        return response()->json(['message' => 'Box créé !', 'box' => $box], 200);
    }

    /**
     * Update a box type.
     *
     * @param  \App\Http\Requests\UpdateBoxTypeRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateBoxType(UpdateBoxTypeRequest $request)
    {
        // Validation and authorization are automatically handled by UpdateBoxTypeRequest

        $box_type = BoxType::find($request->id);

        if(!isset($box_type)){
            return response()->json(['message' => 'Type de Box inexistant !'], 404);
        }

        $changes_made = false;

        if((int)$request->capacity != (int)$box_type->capacity){
            $box_type->capacity = (int)Str::of($request->capacity)->stripTags()->trim();
            $changes_made = true;
        }
        if(0 != \strcmp($request->price, $box_type->price)){
            $box_type->price = Str::of($request->price)->stripTags()->trim();
            $changes_made = true;
        }
        if(0 != \strcmp($request->wording, $box_type->wording)) {

            $validator = Validator::make($request->all(), [
                'wording' => ['unique:box_types']
            ]);
            if($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }
            // Mis à jour du libellé

            $box_type->wording = Str::of($request->wording)->stripTags()->trim()->ucfirst();
            $changes_made = true;
        }

        // Handle promotional price fields
        $newPromoPrice = $request->promotional_price ? (float)$request->promotional_price : null;
        $currentPromoPrice = $box_type->promotional_price ? (float)$box_type->promotional_price : null;
        if($newPromoPrice !== $currentPromoPrice) {
            $box_type->promotional_price = $newPromoPrice;
            $changes_made = true;
        }

        $newStartsAt = $request->promotion_starts_at;
        $currentStartsAt = $box_type->promotion_starts_at ? $box_type->promotion_starts_at->toDateTimeString() : null;
        if($newStartsAt != $currentStartsAt) {
            $box_type->promotion_starts_at = $newStartsAt;
            $changes_made = true;
        }

        $newEndsAt = $request->promotion_ends_at;
        $currentEndsAt = $box_type->promotion_ends_at ? $box_type->promotion_ends_at->toDateTimeString() : null;
        if($newEndsAt != $currentEndsAt) {
            $box_type->promotion_ends_at = $newEndsAt;
            $changes_made = true;
        }

        if($request->hasFile('illustration')) {
            $illustration = $request->file('illustration');
            $imageService = new ImageService();
            $bt_illustration = $imageService->processToBase64($illustration, 256, 256);

            // Mis à jour de l'image d'illustration

            $box_type->illustration = $bt_illustration;
            $changes_made = true;
        }
        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée !'], 204);
        }
        $box_type->save();

        return response()->json(['message' => 'Box mis à jour !', 'box_type' => $box_type], 200);
    }

    /**
     * Delete a box type.
     *
     * @param  \App\Http\Requests\DeleteResourceRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteBoxType(DeleteResourceRequest $request)
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

        $box_type = BoxType::find($request->id);

        if(!isset($box_type)){
            // Log deletion attempt of non-existent box type
            Log::warning('Attempted to delete non-existent box type', [
                'user_id' => $user->id,
                'box_type_id' => $request->id,
                'action' => 'deleteBoxType'
            ]);
            return response()->json(['message' => 'Box inexistant !'], 404);
        }

        // Log box type deletion
        Log::warning('Box type deleted', [
            'user_id' => $user->id,
            'box_type_id' => $box_type->id,
            'wording' => $box_type->wording,
            'action' => 'deleteBoxType'
        ]);

        $box_type->delete();

        return response()->json(['message' => 'Box supprimé !'], 200);
    }

    /**
     * Get slice by a given box type id.
     *
     * @param  integer  $box_type_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlicesByBoxType($box_type_id)
    {
        $box_type = BoxType::find($box_type_id);

        if(!isset($box_type)){
            return response()->json(['message' => 'Type de box inexistant !'], 404);
        }
        $categories = Category::with('b_slices')->get();

        return response()->json(['boxType' => $box_type, 'categories' => $categories], 200);
    }

    /**
     * Get box type by a given id.
     *
     * @param  integer  $box_type_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBoxType($box_type_id)
    {
        $box_type = BoxType::find($box_type_id);

        if(!isset($box_type)){
            return response()->json(['message' => 'Type de box inexistant !'], 404);
        }
        return response()->json($box_type, 200);
    }

    /**
     * Get all box types.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBoxTypes(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // Enables pagination support for scalability as box types grow
        $perPage = min($request->input('per_page', 20), 100);

        $box_types = BoxType::orderBy('wording')->paginate($perPage);

        return response()->json($box_types, 200);
    }
}
