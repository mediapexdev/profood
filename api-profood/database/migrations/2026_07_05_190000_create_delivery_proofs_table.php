<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Proof of delivery captured by the livreur when confirming a drop-off:
 * optional photo(s), whether the delivery was complete or partial, the
 * item checklist snapshot, and a free-text note. Record-only — the manager
 * reconciles amounts for partial deliveries (like refunds).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_proofs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->unique();
            $table->unsignedBigInteger('livreur_id')->nullable();
            // Absolute URLs to the stored proof photos (served by ImageController).
            $table->json('photos')->nullable();
            $table->boolean('is_complete')->default(true);
            // Snapshot of the delivered/undelivered item checklist at confirmation.
            $table->json('items')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('livreur_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_proofs');
    }
};
