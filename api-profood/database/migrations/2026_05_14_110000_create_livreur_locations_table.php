<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backs the manager-side "where is my livreur" view and the per-livreur
     * distance / time analytics gap on the dashboard. Each row is a single
     * GPS ping reported by the livreur app while a delivery is in progress.
     * Cheap to write — we keep raw points and aggregate at query time
     * rather than maintaining derived counters in the hot write path.
     */
    public function up()
    {
        Schema::create('livreur_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livreur_id')->constrained('livreurs')->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->float('accuracy')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['livreur_id', 'recorded_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('livreur_locations');
    }
};
