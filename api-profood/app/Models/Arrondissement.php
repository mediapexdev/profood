<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * 
 */
class Arrondissement extends Model
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
    protected $fillable = ['wording', 'departement_id'];

    /**
     * Get the communes associated with the arrondissement.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Commune>
     */
    public function communes()
    {
        return $this->hasMany(Commune::class);
    }

    /**
     * Get the departement associated with the arrondissement.
     *
     * @return \App\Models\Departement
     */
    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    /**
     * Get the localites associated with the arrondissement.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Localite>
     */
    public function localites()
    {
        return $this->hasMany(Localite::class);
    }
}
