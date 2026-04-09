<?php

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
        Schema::table('users', function (Blueprint $table) {
            // Add api_token_expires_at column after api_token column
            // This stores the expiration timestamp for API tokens
            $table->timestamp('api_token_expires_at')->nullable()->after('api_token');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove the api_token_expires_at column
            $table->dropColumn('api_token_expires_at');
        });
    }
};
