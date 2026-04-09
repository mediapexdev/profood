<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for creating the promotions table.
 *
 * This table stores all promotional codes that can be applied to orders
 * for discounts, free delivery, or other promotional benefits.
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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();

            // Promotion identification
            $table->string('code', 50)->unique()->comment('Unique promotional code (e.g., SUMMER2026, WELCOME10)');
            $table->string('name')->comment('Display name for the promotion');
            $table->text('description')->nullable()->comment('Detailed description of the promotion');

            // Discount configuration
            $table->enum('discount_type', ['percentage', 'fixed_amount', 'free_delivery'])
                  ->comment('Type of discount: percentage (%), fixed amount (CFA), or free delivery');
            $table->decimal('discount_value', 10, 2)
                  ->comment('Value of discount (percentage number or fixed amount in CFA)');

            // Constraints and limits
            $table->decimal('minimum_order_amount', 10, 2)->default(0)
                  ->comment('Minimum order amount required to use this promotion (in CFA)');
            $table->decimal('maximum_discount', 10, 2)->nullable()
                  ->comment('Maximum discount amount that can be applied (useful for percentage discounts)');

            // Usage limits
            $table->integer('usage_limit_total')->nullable()
                  ->comment('Total number of times this promotion can be used across all users (null = unlimited)');
            $table->integer('usage_limit_per_user')->default(1)
                  ->comment('Number of times a single user can use this promotion');
            $table->integer('usage_count')->default(0)
                  ->comment('Current total usage count');

            // Validity period
            $table->timestamp('starts_at')->nullable()
                  ->comment('When the promotion becomes active (null = immediately)');
            $table->timestamp('expires_at')->nullable()
                  ->comment('When the promotion expires (null = never expires)');

            // Status and restrictions
            $table->boolean('is_active')->default(true)
                  ->comment('Whether the promotion is currently active');
            $table->boolean('first_order_only')->default(false)
                  ->comment('Whether this promotion can only be used on first orders');

            // Advanced targeting (JSON field for future extensibility)
            $table->json('applicable_to')->nullable()
                  ->comment('JSON field for specifying which products/categories this applies to (future feature)');

            $table->timestamps();

            // Indexes for performance
            $table->index('code');
            $table->index('is_active');
            $table->index(['starts_at', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('promotions');
    }
};
