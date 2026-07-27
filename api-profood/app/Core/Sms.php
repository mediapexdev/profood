<?php

namespace App\Core;

use Twilio\Rest\Client as TwilioClient;

/**
 * Envoi de SMS transactionnels via Twilio.
 *
 * Centralise la lecture des identifiants (config/services.php, donc
 * compatible `config:cache`, contrairement aux appels env() directs)
 * et le préfixe sénégalais. Sans identifiants configurés, l'envoi lève
 * une exception explicite au lieu du « username is required » du SDK.
 */
class Sms
{
    /** Expéditeur alphanumérique affiché sur le téléphone du destinataire. */
    protected const SENDER = 'Profood';

    public static function isConfigured(): bool
    {
        return (bool) (config('services.twilio.sid') && config('services.twilio.token'));
    }

    /**
     * Envoie un SMS à un numéro sénégalais (le +221 est ajouté ici).
     *
     * @throws \RuntimeException                    identifiants Twilio absents
     * @throws \Twilio\Exceptions\TwilioException   échec de l'envoi
     */
    public static function send(string $phone_number, string $body): void
    {
        if (!self::isConfigured()) {
            throw new \RuntimeException(
                'Identifiants Twilio non configurés (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN manquants dans le .env)'
            );
        }

        $client = new TwilioClient(config('services.twilio.sid'), config('services.twilio.token'));
        $client->messages->create("+221{$phone_number}", [
            'from' => self::SENDER,
            'body' => $body,
        ]);
    }
}
