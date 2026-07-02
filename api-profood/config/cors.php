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

    // This API authenticates with Bearer tokens sent in the Authorization
    // header (no cookies / no session). Combined with 'supports_credentials'
    // => false below, a wildcard origin is valid per the CORS spec and leaks
    // no credentials. To lock down further once every production frontend
    // origin is known, replace ['*'] with the explicit list below — and only
    // re-enable 'supports_credentials' if cookie-based auth is ever introduced.
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

    // false: the apps use Bearer-token auth (Authorization header), not
    // cookies, so credentials are unnecessary. 'true' together with the '*'
    // origin above is rejected by browsers — the CORS spec forbids a wildcard
    // origin when credentials are included.
    'supports_credentials' => false,

];
