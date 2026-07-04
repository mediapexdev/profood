<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'paytech' => [
        // Same credential pair is used to request payments AND to validate
        // incoming IPN webhooks (PayTech hashes these account credentials).
        'api_key'    => env('PAY_TECH_API_KEY'),
        'api_secret' => env('PAY_TECH_API_SECRET'),

        // Sandbox by default: production must explicitly opt into live
        // payments with PAYTECH_TEST_MODE=false in its .env. Fail-safe
        // parsing — a blank or unrecognized value stays in sandbox.
        'test_mode' => (static function () {
            $raw = env('PAYTECH_TEST_MODE', true);
            if (is_bool($raw)) {
                return $raw; // env() already converts "true"/"false" strings
            }
            return !in_array(strtolower(trim((string) $raw)), ['false', '0', 'off', 'no'], true);
        })(),

        // Public URL of the customer app, used for success/cancel redirects
        'client_app_url' => env('CLIENT_APP_URL', 'https://profood-app.com'),
    ],

];
