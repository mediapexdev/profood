<?php

use App\Models\Cart;
use App\Models\Slice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cart_slices', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Slice::class);
            $table->foreignIdFor(Cart::class);
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cart_slices');
    }
};
