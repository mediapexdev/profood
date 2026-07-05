<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Refund records are the source of truth for money returned on an order.
 *
 * The app only RECORDS refunds (amount, reason, who, when) — it never moves
 * funds itself. The actual refund is performed by staff in PayTech / mobile
 * money. An order's refunded total is the sum of its refund rows.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('reason')->nullable();
            // The staff user who recorded the refund (nullable to survive user deletion).
            $table->unsignedBigInteger('refunded_by')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('refunds');
    }
};
