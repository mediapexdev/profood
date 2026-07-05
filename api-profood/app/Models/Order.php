<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class Order extends Model
{
    /**
     * 
     */
    use HasFactory, SoftDeletes;

    /**
     * 
     */
    protected $guarded = [];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'string_id',
        'cart_id',
        'customer_id',
        'order_status_id',
        'montant',
        'delivery_fee',
        'localite_id',
        'order_payment_status_id',
        'payment_method',
        'address',
        'delivery_latitude',
        'delivery_longitude',
        'guest_first_name',
        'guest_last_name',
        'guest_phone_number',
        'guest_email',
        'is_guest_order',
        'promotion_id',
        'discount_amount',
        'promotion_code',
        'livreur_id'
    ];

    /**
     * 
     */
    public function cart()
    {
        // return $this->hasOne(Cart::class, 'id', 'cart_id')->with('boxes', 'cart_slice');
        return $this->hasOne(Cart::class, 'id', 'cart_id')->with('boxesData', 'slicesData');
    }

    /**
     * 
     */
    public function customer()
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id')->with('user');
    }

    /**
     * The delivery locality (null for legacy / free-text orders).
     */
    public function localite()
    {
        return $this->belongsTo(Localite::class);
    }

    /**
     * Recorded refunds (source of truth for money returned).
     */
    public function refunds()
    {
        return $this->hasMany(Refund::class)->orderBy('created_at', 'desc');
    }

    /**
     * 
     */
    public function histories()
    {
        return $this->hasMany(OrderHistory::class)->with('status');
    }

    /**
     * 
     */
    public function paymentStatus()
    {
        return $this->hasOne(OrderPaymentStatus::class, 'id', 'order_payment_status_id');
    }

    /**
     *
     */
    public function status()
    {
        return $this->hasOne(OrderStatus::class, 'id', 'order_status_id');
    }

    public function livreur()
    {
        return $this->hasOne(Livreur::class, 'id', 'livreur_id')->with('user');
    }

    /**
     * Get the promotion that was applied to this order.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Check if this order is a guest order.
     *
     * Note: This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return bool
     */
    public function isGuestOrder() : bool
    {
        return (bool) $this->is_guest_order;
    }

    /**
     * Get the customer's full name (works for both guest and authenticated orders).
     *
     * Note: This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function getCustomerName() : string
    {
        if ($this->isGuestOrder()) {
            return trim($this->guest_first_name . ' ' . $this->guest_last_name);
        }

        return $this->customer ? $this->customer->fullName() : '';
    }

    /**
     * Get the customer's phone number (works for both guest and authenticated orders).
     *
     * Note: This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function getCustomerPhone() : string
    {
        if ($this->isGuestOrder()) {
            return $this->guest_phone_number ?? '';
        }

        return $this->customer ? $this->customer->phoneNumber() : '';
    }

    /**
     * Get the customer's email address (works for both guest and authenticated orders).
     *
     * Note: This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string|null
     */
    public function getCustomerEmail() : ?string
    {
        if ($this->isGuestOrder()) {
            return $this->guest_email;
        }

        return $this->customer ? $this->customer->email() : null;
    }
}
