<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 */
class CartSlice extends Model
{
    /**
     * 
     */
    use HasFactory;

    /**
     * 
     */
    protected $guarded = [];

    /**
     * 
     */
    protected $fillable = ['slice_id', 'cart_id', 'quantity'];

    /**
     * 
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * 
     */
    public function slice()
    {
        return $this->hasOne(Slice::class, 'id', 'slice_id');
    }
}
