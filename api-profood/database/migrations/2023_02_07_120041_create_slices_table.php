<?php

use App\Models\Category;
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
        Schema::create('slices', function (Blueprint $table) {
            $table->id();
            $table->string('wording');
            $table->foreignIdFor(Category::class);
            $table->unsignedInteger('price');
            $table->decimal('weight')->nullable();
            $table->boolean('available_in_box');
            $table->longText('illustration')->nullable();
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
        Schema::dropIfExists('slices');
    }
};
