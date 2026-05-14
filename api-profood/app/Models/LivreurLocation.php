<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LivreurLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'livreur_id',
        'latitude',
        'longitude',
        'accuracy',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }
}
