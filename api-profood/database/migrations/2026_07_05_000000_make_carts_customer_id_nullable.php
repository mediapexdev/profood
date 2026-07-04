<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Guest orders now persist their content as a cart snapshot (Cart + Box +
 * BoxSlice + CartSlice rows) so managers can see what was ordered. Those
 * snapshot carts have no customer, so customer_id must become nullable.
 *
 * Raw driver-aware SQL because doctrine/dbal (required by ->change()) is not
 * installed, and production runs MySQL while local/CI run PostgreSQL.
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
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE carts ALTER COLUMN customer_id DROP NOT NULL');
        } else {
            DB::statement('ALTER TABLE carts MODIFY customer_id BIGINT UNSIGNED NULL');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Guest snapshot carts (customer_id null) would violate NOT NULL:
        // detach them from their orders and remove them before restoring.
        DB::statement('UPDATE orders SET cart_id = NULL WHERE cart_id IN (SELECT id FROM carts WHERE customer_id IS NULL)');
        DB::statement('DELETE FROM box_slices WHERE box_id IN (SELECT id FROM boxes WHERE cart_id IN (SELECT id FROM carts WHERE customer_id IS NULL))');
        DB::statement('DELETE FROM boxes WHERE cart_id IN (SELECT id FROM carts WHERE customer_id IS NULL)');
        DB::statement('DELETE FROM cart_slices WHERE cart_id IN (SELECT id FROM carts WHERE customer_id IS NULL)');
        DB::statement('DELETE FROM carts WHERE customer_id IS NULL');

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE carts ALTER COLUMN customer_id SET NOT NULL');
        } else {
            DB::statement('ALTER TABLE carts MODIFY customer_id BIGINT UNSIGNED NOT NULL');
        }
    }
};
