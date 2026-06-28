<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to support guest orders without requiring user authentication.
 *
 * Adds fields to store guest customer information directly on the order
 * and makes customer_id nullable since guest orders won't have a customer record.
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
        // Make customer_id and cart_id nullable using raw SQL (avoids need for doctrine/dbal)
        // Guest orders don't have a customer record or a cart record
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE orders MODIFY customer_id BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE orders MODIFY cart_id BIGINT UNSIGNED NULL');
        } else {
            DB::statement('ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL');
            DB::statement('ALTER TABLE orders ALTER COLUMN cart_id DROP NOT NULL');
        }

        Schema::table('orders', function (Blueprint $table) {
            // Add guest customer information fields
            $table->string('guest_first_name')->nullable();
            $table->string('guest_last_name')->nullable();
            $table->string('guest_phone_number')->nullable();
            $table->string('guest_email')->nullable();

            // Flag to distinguish guest orders from authenticated customer orders
            $table->boolean('is_guest_order')->default(false);
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
            // Remove guest-specific fields
            $table->dropColumn([
                'guest_first_name',
                'guest_last_name',
                'guest_phone_number',
                'guest_email',
                'is_guest_order'
            ]);
        });

        // Restore customer_id and cart_id to non-nullable (note: this may fail if there are guest orders)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE orders MODIFY customer_id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE orders MODIFY cart_id BIGINT UNSIGNED NOT NULL');
        } else {
            DB::statement('ALTER TABLE orders ALTER COLUMN customer_id SET NOT NULL');
            DB::statement('ALTER TABLE orders ALTER COLUMN cart_id SET NOT NULL');
        }
    }
};
