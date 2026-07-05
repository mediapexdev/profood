<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Global delivery configuration held in a single row.
 */
class DeliverySettings extends Model
{
    protected $table = 'delivery_settings';

    protected $fillable = [
        'default_fee',
        'free_shipping_threshold',
    ];

    protected $casts = [
        'default_fee'             => 'integer',
        'free_shipping_threshold' => 'integer',
    ];

    /**
     * The single settings row, created with defaults on first access so callers
     * never have to null-check.
     *
     * @return self
     */
    public static function current(): self
    {
        return static::firstOrCreate([], [
            'default_fee'             => 0,
            'free_shipping_threshold' => null,
        ]);
    }

    /**
     * Server-authoritative delivery fee for a locality and an order subtotal.
     *
     * Free above the configured threshold; otherwise the commune's fee (the
     * commune is the delivery zone) or the global default when the commune has
     * none or no structured locality is known. Never trusts a client value.
     *
     * @param  int|null  $localiteId
     * @param  float  $subtotal
     * @return int
     */
    public static function resolveFee(?int $localiteId, float $subtotal): int
    {
        $settings = static::current();

        if ($settings->free_shipping_threshold !== null && $subtotal >= $settings->free_shipping_threshold) {
            return 0;
        }

        $default = (int) $settings->default_fee;

        if ($localiteId === null) {
            return $default;
        }

        $localite = Localite::with('commune')->find($localiteId);
        if ($localite === null || $localite->commune === null || $localite->commune->delivery_fee === null) {
            return $default;
        }

        return (int) $localite->commune->delivery_fee;
    }
}
