<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A recorded refund on an order. The app records refunds for traceability; the
 * actual money movement is done by staff in the payment provider.
 */
class Refund extends Model
{
    protected $fillable = [
        'order_id',
        'amount',
        'reason',
        'refunded_by',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * The staff user who recorded the refund.
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }
}
