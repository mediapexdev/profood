<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class Category extends Model
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
    protected $fillable = ['wording', 'illustration'];

    /**
     * 
     */
    public function b_slices()
    {
        return $this->hasMany(Slice::class)->where('available_in_box',true);
    }

    /**
     * 
     */
    public function slices()
    {
        return $this->hasMany(Slice::class);
    }
}
