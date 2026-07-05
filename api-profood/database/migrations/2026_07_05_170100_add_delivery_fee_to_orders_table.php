<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stores what was charged for delivery on each order, plus the structured
 * locality it was delivered to (nullable — legacy and free-text orders have
 * none, and then the fee falls back to the default).
 *
 * delivery_fee defaults to 0 so existing behaviour is unchanged until a fee is
 * configured. Additive columns — MySQL and Postgres safe.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('delivery_fee')->default(0)->after('montant');
            $table->unsignedBigInteger('localite_id')->nullable()->after('delivery_fee');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee', 'localite_id']);
        });
    }
};
