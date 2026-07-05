<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-zone delivery fee. The commune is the delivery zone: localités are far
 * too numerous to price individually, and a localité always belongs to a
 * commune. A NULL fee means "use the global default fee".
 *
 * Additive nullable column — runs cleanly on MySQL and Postgres.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::table('communes', function (Blueprint $table) {
            $table->unsignedInteger('delivery_fee')->nullable()->after('arrondissement_id');
        });
    }

    public function down()
    {
        Schema::table('communes', function (Blueprint $table) {
            $table->dropColumn('delivery_fee');
        });
    }
};
