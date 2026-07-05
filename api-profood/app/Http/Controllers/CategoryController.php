<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteResourceRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
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
class CategoryController extends Controller
{
    /**
     * Add a new category.
     *
     * @param  \App\Http\Requests\StoreCategoryRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCategory(StoreCategoryRequest $request)
    {
        // Validation and authorization are automatically handled by StoreCategoryRequest

        $c_illustration = null;

        if(!$request->hasFile('illustration')){
            return response()->json(['message' => "Veuillez choisir une image d'illustration"], 422);
        }
        $illustration = $request->file('illustration');
        $imageService = new ImageService();
        $c_illustration = $imageService->processToDisk($illustration, 'categories', 256, 256);

        $category = Category::create([
            'wording'       => Str::of($request->wording)->stripTags()->trim()->ucfirst(),
            'illustration'  => $c_illustration
        ]);
        return response()->json(['message' => 'Catégorie créée !', 'category' => $category], 200); 
    }

    /**
     * Update a category.
     *
     * @param  \App\Http\Requests\UpdateCategoryRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCategory(UpdateCategoryRequest $request)
    {
        // Validation and authorization are automatically handled by UpdateCategoryRequest

        $category = Category::find($request->id);

        if(!isset($category)){
            return response()->json(['message' => 'Catégorie inexistante !'], 404);
        }

        $changes_made = false;

        if(0 != \strcmp($request->wording, $category->wording)) {

            $validator = Validator::make($request->all(), [
                'wording' => ['unique:categories']
            ]);
            if($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }
            // Mis à jour du libellé

            $category->wording = Str::of($request->wording)->stripTags()->trim()->ucfirst();
            $changes_made = true;
        }

        if($request->hasFile('illustration')) {
            $illustration = $request->file('illustration');
            $imageService = new ImageService();
            $c_illustration = $imageService->processToDisk($illustration, 'categories', 256, 256);

            // Mis à jour de l'image d'illustration

            $category->illustration = $c_illustration;
            $changes_made = true;
        }
        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée !'], 204); 
        }
        $category->save();

        return response()->json(['message' => 'Catégorie mis à jour !', 'category' => $category], 200); 
    }

    /**
     * Delete a category.
     *
     * @param  \App\Http\Requests\DeleteResourceRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteCategory(DeleteResourceRequest $request)
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

        $category = Category::find($request->id);

        if(!isset($category)){
            return response()->json(['message' => 'Catégorie inexistante !'], 404);
        }
        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée !'], 200);
    }

    /**
     * Get all categories.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategories(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // Pagination ensures optimal performance as category count grows
        $perPage = min($request->input('per_page', 20), 100);

        $categories = Category::orderBy('wording')->paginate($perPage);

        return response()->json($categories, 200);
    }

    /**
     * Get all categories with slice count.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoriesWithSlicesCount(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // Pagination optimizes query performance even with count aggregation
        $perPage = min($request->input('per_page', 20), 100);

        $categories = Category::withCount('slices')->orderBy('wording')->paginate($perPage);

        return response()->json($categories, 200);
    }

    /**
     * Get category by a given id.
     *
     * @param  integer  $category_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategory($category_id)
    {
        $category = Category::find($category_id);

        return response()->json($category, 200);
    }

    /**
     * Get category by a given id with slice count.
     *
     * @param  integer  $category_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoryWithSlicesCount($category_id)
    {
        $category = Category::find($category_id);
        $category->loadCount('slices');

        return response()->json($category, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSlices()
    {
        $slices = Category::with('slices')->orderBy('wording')->get();

        return response()->json($slices, 200);
    }
}
