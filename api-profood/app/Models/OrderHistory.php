<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class OrderHistory extends Model
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
     * 
     */
    protected $fillable = ['order_id','order_status_id'];

    /**
     * 
     */
    public function order()
    {
        return $this->hasOne(Order::class);
    }

    /**
     * 
     */
    public function status()
    {
        return $this->hasOne(OrderStatus::class, 'id', 'order_status_id');
    }
}
