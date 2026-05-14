<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LivreurNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'livreur_id',
        'type',
        'title',
        'body',
        'order_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
