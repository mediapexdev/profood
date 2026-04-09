<?php

use App\Models\Box;
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
        Schema::create('box_slices', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Slice::class);
            $table->foreignIdFor(Box::class);
            $table->unsignedInteger('quantity');
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
        Schema::dropIfExists('box_slices');
    }
};
