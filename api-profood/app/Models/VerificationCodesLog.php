<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationCodesLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'phone_number',
        'for',
        'sent',
        // Vérification serveur du code OTP : le code n'est jamais stocké en
        // clair et ne quitte jamais le serveur (hors environnement local).
        'code_hash',
        'expires_at',
        'attempts',
        'consumed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at'  => 'datetime',
        'consumed_at' => 'datetime',
        'attempts'    => 'integer',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * Sécurité : le hash du code ne doit jamais fuiter dans une réponse JSON.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'code_hash',
    ];
}
