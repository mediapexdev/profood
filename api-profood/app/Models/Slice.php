<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Slice Model
 *
 * Represents an individual product/cut that can be purchased standalone
 * or added to a box. Supports promotional pricing with time-limited discounts.
 */
class Slice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'category_id',
        'wording',
        'price',
        'promotional_price',
        'promotion_starts_at',
        'promotion_ends_at',
        'weight',
        'available_in_box',
        'illustration'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'integer',
        'promotional_price' => 'decimal:2',
        'promotion_starts_at' => 'datetime',
        'promotion_ends_at' => 'datetime',
        'weight' => 'decimal:2',
        'available_in_box' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'is_on_promotion',
        'effective_price',
        'discount_percentage',
    ];

    /**
     * Check if the product is currently on promotion.
     *
     * A product is on promotion when:
     * - It has a promotional_price set
     * - Current date is within the promotion period (if dates are set)
     *
     * @return bool
     */
    public function isOnPromotion(): bool
    {
        // Must have a promotional price
        if ($this->promotional_price === null || $this->promotional_price <= 0) {
            return false;
        }

        // Promotional price must be less than regular price
        if ($this->promotional_price >= $this->price) {
            return false;
        }

        $now = Carbon::now();

        // Check start date (if set)
        if ($this->promotion_starts_at && $now->isBefore($this->promotion_starts_at)) {
            return false;
        }

        // Check end date (if set)
        if ($this->promotion_ends_at && $now->isAfter($this->promotion_ends_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get the effective price (promotional if active, otherwise regular).
     *
     * @return float
     */
    public function getEffectivePrice(): float
    {
        if ($this->isOnPromotion()) {
            return (float) $this->promotional_price;
        }

        return (float) $this->price;
    }

    /**
     * Get the discount percentage if on promotion.
     *
     * @return int|null Percentage as integer (e.g., 20 for 20%), null if not on promotion
     */
    public function getDiscountPercentage(): ?int
    {
        if (!$this->isOnPromotion() || $this->price <= 0) {
            return null;
        }

        $discount = (($this->price - $this->promotional_price) / $this->price) * 100;

        return (int) round($discount);
    }

    /**
     * Accessor for is_on_promotion attribute.
     *
     * @return bool
     */
    public function getIsOnPromotionAttribute(): bool
    {
        return $this->isOnPromotion();
    }

    /**
     * Accessor for effective_price attribute.
     *
     * @return float
     */
    public function getEffectivePriceAttribute(): float
    {
        return $this->getEffectivePrice();
    }

    /**
     * Accessor for discount_percentage attribute.
     *
     * @return int|null
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        return $this->getDiscountPercentage();
    }

    /**
     * 
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
        // return $this->belongsTo(Category::class, 'id', 'category_id');
    }

    /**
     * 
     */
    public function boxes()
    {
        return $this->belongsToMany(Box::class);
    }

    /**
     * 
     */
    // public function carts()
    // {
    //     return $this->belongsToMany(Cart::class);
    // }
}
