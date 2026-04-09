<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * 
 */
class Departement extends Model
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
    protected $fillable = ['wording'];

    /**
     * Get the arrondissements associated with the departement.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Arrondissement>
     */
    public function arrondissements()
    {
        return $this->hasMany(Arrondissement::class);
    }

    /**
     * Get the communes associated with the departement.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Commune>
     */
    public function communes()
    {
        return $this->hasMany(Commune::class);
    }

    /**
     * Get the localites associated with the departement.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Localite>
     */
    public function localites()
    {
        return $this->hasMany(Localite::class);
    }
}
