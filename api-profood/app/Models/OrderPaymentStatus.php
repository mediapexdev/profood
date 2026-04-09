<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 */
class OrderPaymentStatus extends Model
{
    /**
     * 
     */
    use HasFactory;

    /**
     * The different stages of an order.
     */
    const PAID      = 8;
    const UNPAID    = 16;

    /**
     * 
     */
    protected $guarded = [];

    /**
     * 
     */
    protected $fillable = ['wording', 'code'];
}
