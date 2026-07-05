<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Global delivery configuration (a single row):
 * - default_fee: charged when the order's commune has no specific fee, or when
 *   no structured locality is known. Defaults to 0 so nothing changes until the
 *   manager configures delivery pricing.
 * - free_shipping_threshold: at or above this order subtotal, delivery is free.
 *   NULL disables free shipping.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::create('delivery_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('default_fee')->default(0);
            $table->unsignedInteger('free_shipping_threshold')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('delivery_settings');
    }
};
