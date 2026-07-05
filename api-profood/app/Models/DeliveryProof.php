<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Proof of delivery recorded by a livreur when confirming an order:
 * optional photos, complete/partial flag, an item checklist snapshot and a
 * note. One row per order (upserted on confirmation).
 */
class DeliveryProof extends Model
{
    protected $fillable = [
        'order_id',
        'livreur_id',
        'photos',
        'is_complete',
        'items',
        'note',
    ];

    protected $casts = [
        'photos'      => 'array',
        'items'       => 'array',
        'is_complete' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }
}
