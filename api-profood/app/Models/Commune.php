<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class Commune extends Model
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
    protected $fillable = ['wording', 'arrondissement_id', 'departement_id'];

    /**
     * Get the arrondissement associated with the commune or
     * NULL if the commune is not associated with a arrondissement.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * Note : The hasArrondissement() method can be called before this one to check if the commune is associated with a arrondissement or not.
     *
     * @see hasArrondissement()
     *
     * @return \App\Models\Arrondissement|NULL
     */
    public function arrondissement()
    {
        return Arrondissement::find($this->arrondissement_id);
    }

    /**
     * Get the departement associated with the commune.
     *
     * @return \App\Models\Departement
     */
    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    /**
     * Checks whether the commune is associated with a arrondissement or not.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @see arrondissement()
     *
     * @return boolean
     */
    public function hasArrondissement()
    {
        return ($this->arrondissement_id > 0);
    }

    /**
     * Get the localites associated with the commune.
     * 
     * @return Illuminate\Database\Eloquent\Collection<Localite>
     */
    public function localites()
    {
        return $this->hasMany(Localite::class);
    }
}
