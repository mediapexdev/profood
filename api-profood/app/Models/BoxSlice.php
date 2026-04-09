<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class BoxSlice extends Model
{
    /**
     * 
     */
    use HasFactory, SoftDeletes;

    /**
     * 
     */
    protected $guarded  = [];

    /**
     * 
     */
    protected $fillable = ['slice_id', 'box_id', 'quantity'];

    /**
     * 
     */
    public function box()
    {
        return $this->belongsTo(Box::class);
    }

    /**
     * 
     */
    public function slice()
    {
        return $this->hasOne(Slice::class, 'id', 'slice_id');
    }
}
