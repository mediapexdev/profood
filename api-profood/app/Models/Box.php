<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 */
class Box extends Model
{
    /**
     * 
     */
    use HasFactory;

    /**
     * 
     */
    protected $guarded  = [];

    /**
     * 
     */
    protected $fillable = ['box_type_id', 'cart_id'];

    /**
     * 
     */
    public function box_slices()
    {
        return $this->hasMany(BoxSlice::class)->with('slice');
    }

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
    public function slices()
    {
        return $this->belongsToMany(Slice::class);
    }

    /**
     * 
     */
    public function type()
    {
        return $this->belongsTo(BoxType::class, 'box_type_id', 'id');
    }
}
