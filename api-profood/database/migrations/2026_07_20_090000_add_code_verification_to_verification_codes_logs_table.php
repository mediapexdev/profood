<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute la vérification serveur des codes OTP.
     *
     * Jusqu'ici le code de vérification n'était jamais stocké : il était
     * renvoyé au client dans la réponse JSON puis comparé en JavaScript.
     * Connaître un numéro de téléphone suffisait donc à réinitialiser
     * n'importe quel mot de passe. Le code est désormais conservé sous
     * forme de hash, avec une expiration, un compteur de tentatives et une
     * date de consommation (usage unique).
     *
     * Note : uniquement des colonnes Blueprint (pas de SQL brut) afin de
     * rester compatible MySQL (production) et PostgreSQL (local / CI).
     *
     * @return void
     */
    public function up()
    {
        Schema::table('verification_codes_logs', function (Blueprint $table) {
            // Hash du code envoyé par SMS (jamais le code en clair).
            $table->string('code_hash')->nullable();
            // Date d'expiration du code (10 minutes après l'émission).
            $table->timestamp('expires_at')->nullable();
            // Nombre de tentatives de saisie erronées (plafonné à 5).
            $table->integer('attempts')->default(0);
            // Date de consommation : un code ne sert qu'une seule fois.
            $table->timestamp('consumed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('verification_codes_logs', function (Blueprint $table) {
            $table->dropColumn(['code_hash', 'expires_at', 'attempts', 'consumed_at']);
        });
    }
};
