<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds inventory tracking to slices (the butchery's actual stock unit).
 *
 * Both columns are additive and nullable, so this runs cleanly on the local
 * Postgres and the production MySQL without any driver-specific raw SQL
 * (see the MySQL migration fix note).
 *
 * - stock_quantity: SIGNED integer. NULL means the product is NOT tracked
 *   (unlimited) — the default for every existing product until a manager sets
 *   a value. It is signed on purpose: orders are still allowed when stock
 *   reaches 0 ("allow + alert"), so the counter may legitimately go negative
 *   and the manager is warned rather than blocked.
 * - low_stock_threshold: at or below this the product is flagged "low stock".
 *   NULL falls back to an app-level default.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('slices', function (Blueprint $table) {
            $table->integer('stock_quantity')->nullable()->after('available_in_box');
            $table->unsignedInteger('low_stock_threshold')->nullable()->after('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('slices', function (Blueprint $table) {
            $table->dropColumn(['stock_quantity', 'low_stock_threshold']);
        });
    }
};
