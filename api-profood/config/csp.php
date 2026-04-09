<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Content Security Policy (CSP)
    | headers. CSP helps prevent XSS, clickjacking, and other code injection
    | attacks by controlling which resources can be loaded by the browser.
    |
    | Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Enable CSP
    |--------------------------------------------------------------------------
    |
    | Enable or disable Content Security Policy headers globally.
    | Set to false to disable CSP (not recommended for production).
    |
    */
    'enabled' => env('CSP_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Report Only Mode
    |--------------------------------------------------------------------------
    |
    | When true, CSP violations are reported but not enforced.
    | Useful for testing CSP policies before enforcing them.
    | Uses Content-Security-Policy-Report-Only header instead.
    |
    */
    'report_only' => env('CSP_REPORT_ONLY', false),

    /*
    |--------------------------------------------------------------------------
    | Report URI
    |--------------------------------------------------------------------------
    |
    | URI where CSP violation reports should be sent.
    | Set this to monitor CSP violations in production.
    | Example: '/api/csp-violation-report'
    |
    */
    'report_uri' => env('CSP_REPORT_URI', null),

    /*
    |--------------------------------------------------------------------------
    | External Service Domains
    |--------------------------------------------------------------------------
    |
    | Domains for external services the API needs to connect to.
    | These are used in the connect-src CSP directive.
    |
    */
    'external_services' => [

        // Firebase Authentication
        'firebase' => [
            'https://*.googleapis.com',
            'https://*.google.com',
            'https://*.firebaseio.com',
            'https://*.firebase.com',
            'https://*.firebaseapp.com',
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
        ],

        // PayTech Payment Gateway (Senegalese mobile money)
        'paytech' => [
            'https://api.paytech.sn',
            'https://paytech.sn',
        ],

        // Postmark Email Service
        'postmark' => [
            'https://api.postmarkapp.com',
        ],

        // Twilio SMS Service
        'twilio' => [
            'https://api.twilio.com',
            'https://*.twilio.com',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Image Sources
    |--------------------------------------------------------------------------
    |
    | Allowed sources for images (img-src directive).
    | Add CDN domains or external image sources here.
    |
    */
    'image_sources' => [
        "'self'",
        'data:', // Allow base64 encoded images
        'https://*.googleapis.com',
        'https://*.gstatic.com',
        'https://api.paytech.sn',
    ],

    /*
    |--------------------------------------------------------------------------
    | Font Sources
    |--------------------------------------------------------------------------
    |
    | Allowed sources for fonts (font-src directive).
    | Useful if error pages use web fonts.
    |
    */
    'font_sources' => [
        "'self'",
        'https://fonts.gstatic.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Script Sources
    |--------------------------------------------------------------------------
    |
    | Allowed sources for scripts (script-src directive).
    | For APIs, this is typically restricted to 'self'.
    |
    | IMPORTANT: Never add 'unsafe-inline' or 'unsafe-eval' unless
    | absolutely necessary, as they defeat XSS protection.
    |
    */
    'script_sources' => [
        "'self'",
    ],

    /*
    |--------------------------------------------------------------------------
    | Style Sources
    |--------------------------------------------------------------------------
    |
    | Allowed sources for stylesheets (style-src directive).
    | For APIs, this is typically restricted to 'self'.
    |
    */
    'style_sources' => [
        "'self'",
    ],

    /*
    |--------------------------------------------------------------------------
    | Additional CSP Directives
    |--------------------------------------------------------------------------
    |
    | Enable or disable specific CSP directives.
    |
    */
    'directives' => [
        'upgrade_insecure_requests' => true,
        'block_all_mixed_content' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Additional Security Headers
    |--------------------------------------------------------------------------
    |
    | Configuration for additional security headers that complement CSP.
    |
    */
    'additional_headers' => [

        // X-Frame-Options: Prevent clickjacking
        'x_frame_options' => [
            'enabled' => true,
            'value' => 'DENY', // Options: DENY, SAMEORIGIN, ALLOW-FROM uri
        ],

        // X-Content-Type-Options: Prevent MIME sniffing
        'x_content_type_options' => [
            'enabled' => true,
            'value' => 'nosniff',
        ],

        // X-XSS-Protection: Browser XSS filter (legacy)
        'x_xss_protection' => [
            'enabled' => true,
            'value' => '1; mode=block',
        ],

        // Referrer-Policy: Control referrer information
        'referrer_policy' => [
            'enabled' => true,
            'value' => 'strict-origin-when-cross-origin',
        ],

        // Permissions-Policy: Restrict browser features
        'permissions_policy' => [
            'enabled' => true,
            'features' => [
                'geolocation' => [],      // No origins allowed
                'microphone' => [],
                'camera' => [],
                'payment' => [],
                'usb' => [],
                'magnetometer' => [],
                'gyroscope' => [],
                'accelerometer' => [],
                'ambient-light-sensor' => [],
            ],
        ],

        // HSTS: Force HTTPS (production only)
        'hsts' => [
            'enabled' => env('HSTS_ENABLED', true),
            'max_age' => 31536000, // 1 year in seconds
            'include_subdomains' => true,
            'preload' => true,
            'production_only' => true, // Only apply in production
        ],
    ],

];
