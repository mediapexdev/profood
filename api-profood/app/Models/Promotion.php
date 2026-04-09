<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Slice;

/**
 * Promotion Model
 *
 * Represents a promotional code that can be applied to orders for discounts.
 * Handles validation, discount calculation, and usage tracking.
 */
class Promotion extends Model
{
    use HasFactory;

    /**
     * Discount type constants for consistency across the application.
     */
    const TYPE_PERCENTAGE = 'percentage';
    const TYPE_FIXED_AMOUNT = 'fixed_amount';
    const TYPE_FREE_DELIVERY = 'free_delivery';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount',
        'usage_limit_total',
        'usage_limit_per_user',
        'usage_count',
        'starts_at',
        'expires_at',
        'is_active',
        'first_order_only',
        'applicable_to',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'usage_limit_total' => 'integer',
        'usage_limit_per_user' => 'integer',
        'usage_count' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'first_order_only' => 'boolean',
        'applicable_to' => 'array',
    ];

    /**
     * Get all promotion usages for this promotion.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function usages()
    {
        return $this->hasMany(PromotionUsage::class)->with(['user', 'order']);
    }

    /**
     * Get orders that used this promotion.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if the promotion is currently valid (active and within date range).
     *
     * This validates the promotion's status and date constraints but doesn't
     * check usage limits or user-specific restrictions.
     *
     * @return bool True if the promotion is active and within valid date range
     */
    public function isValid(): bool
    {
        // Check if promotion is active
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();

        // Check if promotion has started (if start date is set)
        if ($this->starts_at && $now->isBefore($this->starts_at)) {
            return false;
        }

        // Check if promotion has expired (if expiry date is set)
        if ($this->expires_at && $now->isAfter($this->expires_at)) {
            return false;
        }

        // Check total usage limit (if set)
        if ($this->usage_limit_total !== null && $this->usage_count >= $this->usage_limit_total) {
            return false;
        }

        return true;
    }

    /**
     * Check if this promotion can be used by a specific user.
     *
     * Validates user-specific constraints like usage limits and first-order-only restrictions.
     * This method should be called after isValid() has confirmed the promotion is generally valid.
     *
     * @param  \App\Models\User|null  $user  The user attempting to use the promotion (null for guest)
     * @return bool True if the user can use this promotion
     */
    public function canBeUsedBy(?User $user): bool
    {
        // For guest orders, only check if first_order_only is false
        if ($user === null) {
            // Guests can only use promotions that aren't restricted to first orders
            // (we can't verify guest order history)
            return !$this->first_order_only;
        }

        // Check per-user usage limit
        $userUsageCount = PromotionUsage::where('promotion_id', $this->id)
            ->where('user_id', $user->id)
            ->count();

        if ($userUsageCount >= $this->usage_limit_per_user) {
            return false;
        }

        // Check first order only restriction
        if ($this->first_order_only) {
            // Get customer associated with user
            $customer = Customer::where('user_id', $user->id)->first();

            if (!$customer) {
                return false;
            }

            // Check if customer has any previous orders
            $previousOrderCount = Order::where('customer_id', $customer->id)->count();

            if ($previousOrderCount > 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate the discount amount for a given order amount.
     *
     * This method applies the promotion's discount logic based on the discount type
     * (percentage, fixed amount, or free delivery) and respects minimum order amounts
     * and maximum discount caps.
     *
     * @param  float  $orderAmount  The total order amount before discount (in CFA)
     * @param  float  $deliveryFee  The delivery fee for the order (in CFA), default 0
     * @return float The calculated discount amount (in CFA)
     */
    public function calculateDiscount(float $orderAmount, float $deliveryFee = 0): float
    {
        // Check minimum order amount requirement
        if ($orderAmount < $this->minimum_order_amount) {
            return 0;
        }

        $discount = 0;

        switch ($this->discount_type) {
            case self::TYPE_PERCENTAGE:
                // Calculate percentage discount
                $discount = ($orderAmount * $this->discount_value) / 100;

                // Apply maximum discount cap if set
                if ($this->maximum_discount !== null && $discount > $this->maximum_discount) {
                    $discount = $this->maximum_discount;
                }
                break;

            case self::TYPE_FIXED_AMOUNT:
                // Apply fixed amount discount (but not more than the order amount)
                $discount = min($this->discount_value, $orderAmount);
                break;

            case self::TYPE_FREE_DELIVERY:
                // Discount equals the delivery fee
                $discount = $deliveryFee;
                break;

            default:
                // Unknown discount type, return 0
                $discount = 0;
                break;
        }

        // Ensure discount is never negative
        return max(0, $discount);
    }

    /**
     * Get a human-readable description of the discount.
     *
     * This method returns a formatted string describing what discount the promotion offers,
     * useful for displaying to users in the frontend.
     *
     * @return string A human-readable discount description
     */
    public function getDiscountDescription(): string
    {
        switch ($this->discount_type) {
            case self::TYPE_PERCENTAGE:
                $desc = $this->discount_value . '% de réduction';
                if ($this->maximum_discount !== null) {
                    $desc .= ' (maximum ' . number_format($this->maximum_discount, 0, ',', ' ') . ' CFA)';
                }
                return $desc;

            case self::TYPE_FIXED_AMOUNT:
                return number_format($this->discount_value, 0, ',', ' ') . ' CFA de réduction';

            case self::TYPE_FREE_DELIVERY:
                return 'Livraison gratuite';

            default:
                return 'Promotion';
        }
    }

    /**
     * Increment the usage count for this promotion.
     *
     * This method should be called when a promotion is successfully applied to an order.
     * It uses database-level increment to avoid race conditions.
     *
     * @return void
     */
    public function incrementUsageCount(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Check if this promotion applies to the entire order or specific products.
     *
     * @return bool True if promotion applies to all products (order-level discount)
     */
    public function isOrderLevel(): bool
    {
        $applicableTo = $this->applicable_to;

        // If applicable_to is null or empty, it's an order-level promotion
        if (empty($applicableTo)) {
            return true;
        }

        // If type is explicitly "all" or not set, it's order-level
        return ($applicableTo['type'] ?? 'all') === 'all';
    }

    /**
     * Check if this promotion applies to a specific product.
     *
     * @param  string  $productType  Type of product: 'box_type', 'category', or 'slice'
     * @param  int  $productId  The product ID
     * @return bool True if the promotion applies to this product
     */
    public function appliesToProduct(string $productType, int $productId): bool
    {
        // If order-level, applies to everything
        if ($this->isOrderLevel()) {
            return true;
        }

        $applicableTo = $this->applicable_to;

        // Check based on product type
        switch ($productType) {
            case 'box_type':
                $boxTypeIds = $applicableTo['box_type_ids'] ?? [];
                return in_array($productId, $boxTypeIds);

            case 'category':
                $categoryIds = $applicableTo['category_ids'] ?? [];
                return in_array($productId, $categoryIds);

            case 'slice':
                // Check if slice ID is directly included
                $sliceIds = $applicableTo['slice_ids'] ?? [];
                if (in_array($productId, $sliceIds)) {
                    return true;
                }

                // Also check if slice's category is included
                $categoryIds = $applicableTo['category_ids'] ?? [];
                if (!empty($categoryIds)) {
                    $slice = Slice::find($productId);
                    if ($slice && in_array($slice->category_id, $categoryIds)) {
                        return true;
                    }
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Calculate the discount amount for cart items (product-specific support).
     *
     * For order-level promotions (applicable_to is null or type is "all"),
     * this behaves like the original calculateDiscount method.
     *
     * For product-specific promotions, it only calculates discount on eligible items.
     *
     * @param  float  $orderAmount  The total order amount before discount (in CFA)
     * @param  float  $deliveryFee  The delivery fee for the order (in CFA), default 0
     * @param  array|null  $cartItems  Array of cart items with structure:
     *                                  [{type: 'box', box_type_id: 1, quantity: 1, price: 5000},
     *                                   {type: 'slice', slice_id: 2, quantity: 3, price: 1500, category_id: 1}]
     * @return array ['total_discount' => float, 'eligible_amount' => float, 'item_discounts' => array]
     */
    public function calculateDiscountForCart(float $orderAmount, float $deliveryFee = 0, ?array $cartItems = null): array
    {
        $result = [
            'total_discount' => 0,
            'eligible_amount' => 0,
            'item_discounts' => [],
        ];

        // Check minimum order amount requirement (applies to total order)
        if ($orderAmount < $this->minimum_order_amount) {
            return $result;
        }

        // If no cart items provided or order-level promotion, use original logic
        if ($cartItems === null || $this->isOrderLevel()) {
            $result['eligible_amount'] = $orderAmount;
            $result['total_discount'] = $this->calculateDiscount($orderAmount, $deliveryFee);
            return $result;
        }

        // Product-specific promotion: calculate eligible amount
        $eligibleAmount = 0;

        foreach ($cartItems as $item) {
            $itemPrice = ($item['price'] ?? 0) * ($item['quantity'] ?? 1);
            $isEligible = false;

            if ($item['type'] === 'box') {
                $isEligible = $this->appliesToProduct('box_type', $item['box_type_id'] ?? 0);
            } elseif ($item['type'] === 'slice') {
                $isEligible = $this->appliesToProduct('slice', $item['slice_id'] ?? 0);
            }

            if ($isEligible) {
                $eligibleAmount += $itemPrice;
                $result['item_discounts'][] = [
                    'type' => $item['type'],
                    'id' => $item['type'] === 'box' ? ($item['box_type_id'] ?? 0) : ($item['slice_id'] ?? 0),
                    'eligible' => true,
                    'amount' => $itemPrice,
                ];
            }
        }

        $result['eligible_amount'] = $eligibleAmount;

        // Calculate discount based on eligible amount
        if ($eligibleAmount > 0) {
            $discount = 0;

            switch ($this->discount_type) {
                case self::TYPE_PERCENTAGE:
                    $discount = ($eligibleAmount * $this->discount_value) / 100;
                    if ($this->maximum_discount !== null && $discount > $this->maximum_discount) {
                        $discount = $this->maximum_discount;
                    }
                    break;

                case self::TYPE_FIXED_AMOUNT:
                    $discount = min($this->discount_value, $eligibleAmount);
                    break;

                case self::TYPE_FREE_DELIVERY:
                    $discount = $deliveryFee;
                    break;
            }

            $result['total_discount'] = max(0, $discount);
        }

        return $result;
    }

    /**
     * Get all box type IDs this promotion applies to.
     *
     * @return array Array of box type IDs, empty if order-level
     */
    public function getApplicableBoxTypeIds(): array
    {
        if ($this->isOrderLevel()) {
            return [];
        }

        return $this->applicable_to['box_type_ids'] ?? [];
    }

    /**
     * Get all category IDs this promotion applies to.
     *
     * @return array Array of category IDs, empty if order-level
     */
    public function getApplicableCategoryIds(): array
    {
        if ($this->isOrderLevel()) {
            return [];
        }

        return $this->applicable_to['category_ids'] ?? [];
    }

    /**
     * Get all slice IDs this promotion applies to.
     *
     * @return array Array of slice IDs, empty if order-level
     */
    public function getApplicableSliceIds(): array
    {
        if ($this->isOrderLevel()) {
            return [];
        }

        return $this->applicable_to['slice_ids'] ?? [];
    }

    /**
     * Scope to get only active promotions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get promotions valid at a specific date.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  \Carbon\Carbon|null  $date  The date to check (defaults to now)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeValidAt($query, $date = null)
    {
        $date = $date ?? Carbon::now();

        return $query->where(function ($q) use ($date) {
            $q->whereNull('starts_at')
              ->orWhere('starts_at', '<=', $date);
        })->where(function ($q) use ($date) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>=', $date);
        });
    }

    /**
     * Scope to get promotions that haven't reached their usage limit.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithinUsageLimit($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('usage_limit_total')
              ->orWhereRaw('usage_count < usage_limit_total');
        });
    }
}
