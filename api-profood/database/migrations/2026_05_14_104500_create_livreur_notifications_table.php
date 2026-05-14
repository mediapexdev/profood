<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backs the livreur app's in-app inbox so the existing mock-based
     * UI can switch to real data, and so future events (assignment,
     * status change, payment, alerts) have a durable place to land
     * even before push notifications ship.
     *
     * `type` mirrors the TS union NotificationType used by the
     * livreur app: delivery | schedule | message | payment | alert.
     * `order_id` is nullable so non-order events (schedule, alert)
     * still fit. `read_at` is a timestamp rather than a boolean so
     * we keep when the driver acknowledged each row.
     */
    public function up()
    {
        Schema::create('livreur_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livreur_id')->constrained('livreurs')->cascadeOnDelete();
            $table->string('type', 32)->default('delivery');
            $table->string('title');
            $table->text('body');
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['livreur_id', 'read_at']);
            $table->index(['livreur_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('livreur_notifications');
    }
};
