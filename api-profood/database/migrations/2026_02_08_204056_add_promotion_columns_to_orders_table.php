<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for adding promotion-related columns to the orders table.
 *
 * This extends the orders table to track which promotion was used
 * and what discount was applied.
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
        Schema::table('orders', function (Blueprint $table) {
            // Foreign key to promotions table
            $table->foreignId('promotion_id')
                  ->nullable()
                  ->after('is_guest_order')
                  ->constrained()
                  ->onDelete('set null')
                  ->comment('Promotion that was applied to this order');

            // Store the actual discount amount applied
            $table->decimal('discount_amount', 10, 2)
                  ->default(0)
                  ->after('promotion_id')
                  ->comment('Total discount amount applied from promotion (in CFA)');

            // Store the promotion code used (for historical reference)
            $table->string('promotion_code', 50)
                  ->nullable()
                  ->after('discount_amount')
                  ->comment('The promotion code that was used (stored for reference even if promotion is deleted)');

            // Index for querying orders by promotion
            $table->index('promotion_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['promotion_id']);

            // Then drop columns
            $table->dropColumn(['promotion_id', 'discount_amount', 'promotion_code']);
        });
    }
};
