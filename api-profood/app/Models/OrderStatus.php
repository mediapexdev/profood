<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 */
class OrderStatus extends Model
{
    /**
     * 
     */
    use HasFactory;

    /**
     * The different stages of an order.
     */
    const AWAITING_PROCESSING           = 8;
    const BEING_PROCESSED               = 16;
    const IN_THE_PROCESS_OF_DELIVERY    = 32;
    const DELIVERED                     = 64;
    const CANCELLED                     = 80;

    /**
     * 
     */
    protected $guarded = [];

    /**
     * 
     */
    protected $fillable = ['wording', 'code'];
}
