<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],

    // 'allowed_origins' => [
    //     'http://localhost:3000',
    //     'http://localhost:3001',
    //     'http://localhost:3002',
    //     'http://localhost:8100',
    //     'http://192.168.1.4:8100',
    //     'http://192.168.1.4:3000',
    //     'http://192.168.1.4:3001',
    //     'http://192.168.1.4:8100',
    //     'https://profood.vercel.app',
    //     'https://profood-app-five.vercel.app',
    //     'http://127.0.0.1:3000',
    //     'http://127.0.0.1:3001',
    //     'http://127.0.0.1:8100',

    //     'https://paytech.sn'
    // ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
