<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to add promotional pricing fields to slices and box_types tables.
 *
 * This enables time-limited promotional prices on products without requiring
 * customers to enter a promo code. The promotional price is automatically
 * displayed when within the valid date range.
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
        // Add promotional price fields to slices table
        Schema::table('slices', function (Blueprint $table) {
            $table->decimal('promotional_price', 10, 2)->nullable()->after('price')
                  ->comment('Promotional price in FCFA (null = no promotion)');
            $table->timestamp('promotion_starts_at')->nullable()->after('promotional_price')
                  ->comment('When the promotional price becomes active');
            $table->timestamp('promotion_ends_at')->nullable()->after('promotion_starts_at')
                  ->comment('When the promotional price expires');
        });

        // Add promotional price fields to box_types table
        Schema::table('box_types', function (Blueprint $table) {
            $table->decimal('promotional_price', 10, 2)->nullable()->after('price')
                  ->comment('Promotional price in FCFA (null = no promotion)');
            $table->timestamp('promotion_starts_at')->nullable()->after('promotional_price')
                  ->comment('When the promotional price becomes active');
            $table->timestamp('promotion_ends_at')->nullable()->after('promotion_starts_at')
                  ->comment('When the promotional price expires');
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
            $table->dropColumn(['promotional_price', 'promotion_starts_at', 'promotion_ends_at']);
        });

        Schema::table('box_types', function (Blueprint $table) {
            $table->dropColumn(['promotional_price', 'promotion_starts_at', 'promotion_ends_at']);
        });
    }
};
