<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for creating the promotion_usages table.
 *
 * This table tracks each time a promotion code is used by a customer,
 * maintaining a complete audit trail of promotion redemptions.
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
        Schema::create('promotion_usages', function (Blueprint $table) {
            $table->id();

            // Foreign key relationships
            $table->foreignId('promotion_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->comment('Reference to the promotion that was used');

            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('set null')
                  ->comment('User who used the promotion (null for guest orders)');

            $table->foreignId('order_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->comment('Order where the promotion was applied');

            // Usage details
            $table->decimal('discount_applied', 10, 2)
                  ->comment('Actual discount amount that was applied to the order (in CFA)');

            $table->timestamps();

            // Indexes for efficient querying
            $table->index('promotion_id');
            $table->index('user_id');
            $table->index('order_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('promotion_usages');
    }
};
