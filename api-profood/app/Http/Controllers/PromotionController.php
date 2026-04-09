<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePromotionRequest;
use App\Http\Requests\UpdatePromotionRequest;
use App\Http\Requests\ValidatePromoCodeRequest;
use App\Models\Promotion;
use App\Models\PromotionUsage;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PromotionController
 *
 * Handles all promotion-related operations including CRUD operations
 * and promo code validation for orders.
 */
class PromotionController extends Controller
{
    /**
     * Get a paginated list of all promotions (Admin only).
     *
     * Returns promotions with their usage statistics, ordered by creation date.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            // Get pagination parameters from request
            $perPage = $request->input('per_page', 15);
            $page = $request->input('page', 1);

            // Get promotions with pagination
            $promotions = Promotion::orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json($promotions, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching promotions', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération des promotions.'
            ], 500);
        }
    }

    /**
     * Create a new promotion (Admin only).
     *
     * @param  \App\Http\Requests\StorePromotionRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StorePromotionRequest $request)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            // Create the promotion using validated data
            $promotion = Promotion::create($request->validated());

            Log::info('Promotion created', [
                'promotion_id' => $promotion->id,
                'code' => $promotion->code,
                'created_by' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Promotion créée avec succès.',
                'promotion' => $promotion
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating promotion', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $request->validated()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la création de la promotion.'
            ], 500);
        }
    }

    /**
     * Get a specific promotion by ID (Admin only).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);

            // Load usage count and other statistics
            $promotion->load('usages');

            return response()->json($promotion, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching promotion', [
                'error' => $e->getMessage(),
                'promotion_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération de la promotion.'
            ], 500);
        }
    }

    /**
     * Update an existing promotion (Admin only).
     *
     * @param  \App\Http\Requests\UpdatePromotionRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdatePromotionRequest $request, $id)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);

            // Update only the fields that were provided
            $promotion->update($request->validated());

            Log::info('Promotion updated', [
                'promotion_id' => $promotion->id,
                'code' => $promotion->code,
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Promotion mise à jour avec succès.',
                'promotion' => $promotion->fresh()
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating promotion', [
                'error' => $e->getMessage(),
                'promotion_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la promotion.'
            ], 500);
        }
    }

    /**
     * Delete a promotion (Admin only).
     *
     * Note: This will set promotion_id to null in related orders (due to onDelete('set null')),
     * but the order will retain the promotion_code and discount_amount for historical records.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);

            // Store code for logging before deletion
            $code = $promotion->code;

            $promotion->delete();

            Log::info('Promotion deleted', [
                'promotion_id' => $id,
                'code' => $code,
                'deleted_by' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Promotion supprimée avec succès.'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting promotion', [
                'error' => $e->getMessage(),
                'promotion_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression de la promotion.'
            ], 500);
        }
    }

    /**
     * Get usage history for a specific promotion (Admin only).
     *
     * Returns a paginated list of all times this promotion was used,
     * including user and order information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function usages(Request $request, $id)
    {
        // Verify user has admin or manager role
        if (!$this->isAdminOrManager()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $promotion = Promotion::findOrFail($id);

            // Get pagination parameters
            $perPage = $request->input('per_page', 15);
            $page = $request->input('page', 1);

            // Get usages with related data
            $usages = PromotionUsage::where('promotion_id', $id)
                ->with(['user', 'order'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'promotion' => $promotion,
                'usages' => $usages
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Promotion non trouvée.'], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching promotion usages', [
                'error' => $e->getMessage(),
                'promotion_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération des utilisations.'
            ], 500);
        }
    }

    /**
     * Validate a promo code (Public endpoint).
     *
     * This endpoint allows customers to check if a promo code is valid
     * and see what discount they would receive before placing an order.
     *
     * Supports product-specific promotions when cart_items is provided.
     *
     * @param  \App\Http\Requests\ValidatePromoCodeRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validatePromoCode(ValidatePromoCodeRequest $request)
    {
        try {
            $code = $request->input('code');
            $orderAmount = $request->input('order_amount');
            $deliveryFee = $request->input('delivery_fee', 0);
            $cartItems = $request->input('cart_items'); // Optional: for product-specific promos

            // Find the promotion by code
            $promotion = Promotion::where('code', $code)->first();

            if (!$promotion) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Code promotionnel invalide.'
                ], 200);
            }

            // Check if promotion is generally valid (active, within dates, usage limits)
            if (!$promotion->isValid()) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Ce code promotionnel n\'est plus valide ou a atteint sa limite d\'utilisation.'
                ], 200);
            }

            // Get the authenticated user (if any)
            $user = Auth::user();

            // Check if user can use this promotion
            if (!$promotion->canBeUsedBy($user)) {
                $errorMessage = 'Vous ne pouvez pas utiliser ce code promotionnel.';

                // Provide more specific error messages
                if ($promotion->first_order_only) {
                    $errorMessage = 'Ce code est réservé aux nouvelles commandes uniquement.';
                } else {
                    $errorMessage = 'Vous avez déjà utilisé ce code promotionnel le nombre maximum de fois autorisé.';
                }

                return response()->json([
                    'valid' => false,
                    'error' => $errorMessage
                ], 200);
            }

            // Calculate the discount (supports product-specific promotions)
            $discountResult = $promotion->calculateDiscountForCart($orderAmount, $deliveryFee, $cartItems);
            $discountAmount = $discountResult['total_discount'];

            // Check if minimum order amount is met
            if ($discountAmount == 0 && $orderAmount < $promotion->minimum_order_amount) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Montant minimum de commande non atteint. Minimum requis: ' .
                              number_format($promotion->minimum_order_amount, 0, ',', ' ') . ' CFA.'
                ], 200);
            }

            // For product-specific promos, check if any items are eligible
            if (!$promotion->isOrderLevel() && $discountResult['eligible_amount'] == 0) {
                return response()->json([
                    'valid' => false,
                    'error' => 'Ce code promotionnel ne s\'applique pas aux produits de votre panier.'
                ], 200);
            }

            // Return success with promotion details
            $response = [
                'valid' => true,
                'promotion' => [
                    'id' => $promotion->id,
                    'code' => $promotion->code,
                    'name' => $promotion->name,
                    'description' => $promotion->description,
                    'discount_type' => $promotion->discount_type,
                    'discount_value' => $promotion->discount_value,
                    'discount_description' => $promotion->getDiscountDescription(),
                    'minimum_order_amount' => $promotion->minimum_order_amount,
                    'discount_amount' => $discountAmount,
                    'is_product_specific' => !$promotion->isOrderLevel(),
                    'applicable_to' => $promotion->applicable_to,
                ],
                'discount_amount' => $discountAmount,
                'eligible_amount' => $discountResult['eligible_amount'],
                'message' => 'Code promotionnel valide! Vous économisez ' .
                            number_format($discountAmount, 0, ',', ' ') . ' CFA.'
            ];

            // Include item-level discounts for product-specific promos
            if (!$promotion->isOrderLevel() && !empty($discountResult['item_discounts'])) {
                $response['item_discounts'] = $discountResult['item_discounts'];
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error('Error validating promo code', [
                'error' => $e->getMessage(),
                'code' => $request->input('code'),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'valid' => false,
                'error' => 'Erreur lors de la validation du code promotionnel.'
            ], 500);
        }
    }

    /**
     * Get active promotions for specific products (Public endpoint).
     *
     * This endpoint returns all currently valid promotions that apply to
     * the specified products. Used to display promo badges on product cards.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActivePromotionsForProducts(Request $request)
    {
        try {
            $boxTypeIds = $request->input('box_type_ids', []);
            $categoryIds = $request->input('category_ids', []);
            $sliceIds = $request->input('slice_ids', []);

            // Get all active and valid promotions
            $promotions = Promotion::active()
                ->validAt()
                ->withinUsageLimit()
                ->get();

            $result = [
                'box_types' => [],
                'categories' => [],
                'slices' => [],
                'order_level' => [], // Promotions that apply to entire orders
            ];

            foreach ($promotions as $promotion) {
                $promoData = [
                    'id' => $promotion->id,
                    'code' => $promotion->code,
                    'name' => $promotion->name,
                    'discount_type' => $promotion->discount_type,
                    'discount_value' => $promotion->discount_value,
                    'discount_description' => $promotion->getDiscountDescription(),
                    'minimum_order_amount' => $promotion->minimum_order_amount,
                ];

                // If order-level promotion, add to order_level array
                if ($promotion->isOrderLevel()) {
                    $result['order_level'][] = $promoData;
                    continue;
                }

                // Check which box types this promotion applies to
                $applicableBoxTypeIds = $promotion->getApplicableBoxTypeIds();
                foreach ($boxTypeIds as $boxTypeId) {
                    if (in_array($boxTypeId, $applicableBoxTypeIds)) {
                        if (!isset($result['box_types'][$boxTypeId])) {
                            $result['box_types'][$boxTypeId] = [];
                        }
                        $result['box_types'][$boxTypeId][] = $promoData;
                    }
                }

                // Check which categories this promotion applies to
                $applicableCategoryIds = $promotion->getApplicableCategoryIds();
                foreach ($categoryIds as $categoryId) {
                    if (in_array($categoryId, $applicableCategoryIds)) {
                        if (!isset($result['categories'][$categoryId])) {
                            $result['categories'][$categoryId] = [];
                        }
                        $result['categories'][$categoryId][] = $promoData;
                    }
                }

                // Check which slices this promotion applies to
                $applicableSliceIds = $promotion->getApplicableSliceIds();
                foreach ($sliceIds as $sliceId) {
                    // Direct slice match
                    if (in_array($sliceId, $applicableSliceIds)) {
                        if (!isset($result['slices'][$sliceId])) {
                            $result['slices'][$sliceId] = [];
                        }
                        $result['slices'][$sliceId][] = $promoData;
                    }
                    // Also check if slice's category is included
                    elseif (!empty($applicableCategoryIds)) {
                        $slice = \App\Models\Slice::find($sliceId);
                        if ($slice && in_array($slice->category_id, $applicableCategoryIds)) {
                            if (!isset($result['slices'][$sliceId])) {
                                $result['slices'][$sliceId] = [];
                            }
                            $result['slices'][$sliceId][] = $promoData;
                        }
                    }
                }
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching promotions for products', [
                'error' => $e->getMessage(),
                'box_type_ids' => $request->input('box_type_ids'),
                'category_ids' => $request->input('category_ids'),
                'slice_ids' => $request->input('slice_ids'),
            ]);

            return response()->json([
                'error' => 'Erreur lors de la récupération des promotions.'
            ], 500);
        }
    }

    /**
     * Get all active promotions (Public endpoint).
     *
     * Returns all currently valid promotions for display in the app,
     * including both order-level and product-specific promotions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActivePromotions()
    {
        try {
            $promotions = Promotion::active()
                ->validAt()
                ->withinUsageLimit()
                ->get()
                ->map(function ($promotion) {
                    return [
                        'id' => $promotion->id,
                        'code' => $promotion->code,
                        'name' => $promotion->name,
                        'description' => $promotion->description,
                        'discount_type' => $promotion->discount_type,
                        'discount_value' => $promotion->discount_value,
                        'discount_description' => $promotion->getDiscountDescription(),
                        'minimum_order_amount' => $promotion->minimum_order_amount,
                        'is_product_specific' => !$promotion->isOrderLevel(),
                        'applicable_to' => $promotion->applicable_to,
                        'expires_at' => $promotion->expires_at,
                    ];
                });

            return response()->json([
                'promotions' => $promotions
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching active promotions', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Erreur lors de la récupération des promotions.'
            ], 500);
        }
    }

    /**
     * Helper method to check if the authenticated user is an admin or manager.
     *
     * @return bool
     */
    private function isAdminOrManager(): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        return in_array($user->role->code, [Role::ADMIN, Role::SUPER_ADMIN, Role::MANAGER]);
    }
}
