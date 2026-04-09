<?php

use App\Models\Cart;
use App\Models\Customer;
use App\Models\OrderPaymentStatus;
use App\Models\OrderStatus;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('string_id')->nullable()->unique();
            $table->foreignIdFor(Cart::class)->unique();
            $table->foreignIdFor(Customer::class);
            $table->foreignIdFor(OrderStatus::class);
            $table->string('montant');
            $table->foreignIdFor(OrderPaymentStatus::class);
            $table->string('payment_method')->nullable();
            $table->string('address');
            $table->softDeletes();
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
        Schema::dropIfExists('orders');
    }
};
