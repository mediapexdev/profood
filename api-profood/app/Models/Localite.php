<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * 
 */
class Localite extends Model
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
    protected $fillable = ['wording', 'commune_id', 'arrondissement_id', 'departement_id'];

    /**
     * Get the arrondissement associated with the localite or
     * NULL if the localite is not associated with a arrondissement.
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
        // return Arrondissement::find($this->arrondissement_id);
        return $this->belongsTo(Arrondissement::class);
    }

    /**
     * Get the commune associated with the localite.
     *
     * @return \App\Models\Commune
     */
    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }

    /**
     * Get the departement associated with the localite.
     *
     * @return \App\Models\Departement
     */
    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    /**
     * Checks whether the localite is associated with a arrondissement or not.
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
}
