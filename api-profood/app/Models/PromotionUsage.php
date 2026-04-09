<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * PromotionUsage Model
 *
 * Tracks each time a promotion is used by a customer on an order.
 * Provides a complete audit trail of promotion redemptions.
 */
class PromotionUsage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'promotion_id',
        'user_id',
        'order_id',
        'discount_applied',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'discount_applied' => 'decimal:2',
    ];

    /**
     * Get the promotion that was used.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Get the user who used the promotion.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order where the promotion was applied.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
