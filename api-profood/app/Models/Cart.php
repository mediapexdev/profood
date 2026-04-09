<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class Cart extends Model
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
    protected $fillable = ['id', 'customer_id', 'is_current'];

    /**
     * 
     */
    public function boxes()
    {
        return $this->hasMany(Box::class);
    }

    /**
     * 
     */
    public function boxesData()
    {
        return $this->hasMany(Box::class)->with('type', 'box_slices');
    }

    /**
     * 
     */
    public function command()
    {
        return $this->hasOne(Command::class);
    }

    /**
     * 
     */
    public function user()
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id');
    }

    /**
     * 
     */
    // public function slices()
    // {
    //     return $this->belongsToMany(Slice::class);
    // }

    /**
     * 
     */
    public function boxSlices()
    {
        return $this->hasMany(BoxSlice::class);
    }

    /**
     * 
     */
    public function slices()
    {
        return $this->hasMany(CartSlice::class);
    }

    /**
     * 
     */
    public function slicesData()
    {
        return $this->hasMany(CartSlice::class)->with('slice');
    }
}
