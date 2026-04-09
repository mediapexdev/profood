<?php

use App\Models\Commune;
use App\Models\Departement;
use App\Models\Arrondissement;
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
        Schema::create('localites', function (Blueprint $table) {
            $table->id();
            $table->string('wording');
            $table->foreignIdFor(Commune::class);
            $table->foreignIdFor(Departement::class);
            $table->foreignIdFor(Arrondissement::class);
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
        Schema::dropIfExists('localites');
    }
};
