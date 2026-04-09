<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Content Security Policy Middleware
 *
 * Implements CSP headers to protect against XSS, clickjacking, and other code injection attacks.
 * This middleware is specifically configured for a REST API that integrates with:
 * - Firebase (authentication)
 * - PayTech (payment gateway)
 * - Postmark (email service)
 * - Twilio (SMS service)
 *
 * CSP directives are tailored for API responses (primarily JSON) rather than HTML content.
 * Configuration is loaded from config/csp.php for easy customization.
 */
class ContentSecurityPolicy
{
    /**
     * Handle an incoming request and add CSP headers to the response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\JsonResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Check if CSP is enabled in configuration
        if (!config('csp.enabled', true)) {
            return $response;
        }

        // Build CSP policy directives
        $cspDirectives = $this->buildCspDirectives();

        // Determine if we're in report-only mode
        $headerName = config('csp.report_only', false)
            ? 'Content-Security-Policy-Report-Only'
            : 'Content-Security-Policy';

        // Add CSP header
        $response->headers->set($headerName, $cspDirectives);

        // Add additional security headers for defense in depth
        $this->addSecurityHeaders($response);

        return $response;
    }

    /**
     * Build Content Security Policy directives suitable for an API
     *
     * Note: For a REST API that returns JSON, most CSP directives are restrictive
     * since we don't serve HTML content. However, they provide defense in depth
     * and protect against potential attack vectors.
     *
     * @return string
     */
    private function buildCspDirectives(): string
    {
        // For API responses, we use a strict policy since we're not serving HTML
        $directives = [
            // Default policy: deny all unless explicitly allowed
            "default-src 'none'",

            // Scripts: Load from configuration
            "script-src " . implode(' ', config('csp.script_sources', ["'self'"])),

            // Styles: Load from configuration
            "style-src " . implode(' ', config('csp.style_sources', ["'self'"])),

            // Images: Load from configuration
            "img-src " . implode(' ', config('csp.image_sources', ["'self'"])),

            // Fonts: Load from configuration
            "font-src " . implode(' ', config('csp.font_sources', ["'self'"])),

            // Connect (AJAX/Fetch): Allow API connections to required services
            // This is the most important directive for API functionality
            "connect-src 'self' " . implode(' ', $this->getAllowedConnectSources()),

            // Forms: Only allow form submissions to self
            "form-action 'self'",

            // Frames: Completely disallow embedding (clickjacking protection)
            "frame-ancestors 'none'",

            // Base URI: Restrict to self to prevent base tag injection
            "base-uri 'self'",

            // Object/Embed: Disallow plugins (Flash, Java, etc.)
            "object-src 'none'",

            // Media: Only from self (if serving audio/video)
            "media-src 'self'",

            // Manifest: Allow from self (for PWA manifest if served)
            "manifest-src 'self'",

            // Worker: Allow from self (for service workers)
            "worker-src 'self'",
        ];

        // Add upgrade-insecure-requests directive if enabled
        if (config('csp.directives.upgrade_insecure_requests', true)) {
            $directives[] = 'upgrade-insecure-requests';
        }

        // Add block-all-mixed-content directive if enabled
        if (config('csp.directives.block_all_mixed_content', true)) {
            $directives[] = 'block-all-mixed-content';
        }

        // Add report-uri if configured
        $reportUri = config('csp.report_uri');
        if (!empty($reportUri)) {
            $directives[] = "report-uri {$reportUri}";
        }

        return implode('; ', $directives);
    }

    /**
     * Get allowed sources for connect-src directive
     *
     * These are the external services the API needs to communicate with.
     * Domains are loaded from config/csp.php for easy maintenance.
     *
     * @return array
     */
    private function getAllowedConnectSources(): array
    {
        $sources = [];

        // Get all external services from configuration
        $externalServices = config('csp.external_services', []);

        // Flatten the array of service domains
        foreach ($externalServices as $service => $domains) {
            $sources = array_merge($sources, $domains);
        }

        // Add the application's own URL
        $appUrl = config('app.url');
        if (!empty($appUrl)) {
            $sources[] = $appUrl;
        }

        return $sources;
    }

    /**
     * Add additional security headers for comprehensive protection
     *
     * These headers work in conjunction with CSP to provide defense in depth:
     * - X-Frame-Options: Prevents clickjacking (older browsers)
     * - X-Content-Type-Options: Prevents MIME sniffing attacks
     * - X-XSS-Protection: Enables browser XSS filter (legacy browsers)
     * - Referrer-Policy: Controls referrer information leakage
     * - Permissions-Policy: Restricts browser features and APIs
     * - Strict-Transport-Security: Forces HTTPS (production only)
     *
     * @param  \Illuminate\Http\Response|\Illuminate\Http\JsonResponse  $response
     * @return void
     */
    private function addSecurityHeaders($response): void
    {
        // X-Frame-Options: Prevent clickjacking attacks
        if (config('csp.additional_headers.x_frame_options.enabled', true)) {
            $response->headers->set(
                'X-Frame-Options',
                config('csp.additional_headers.x_frame_options.value', 'DENY')
            );
        }

        // X-Content-Type-Options: Prevent MIME sniffing
        if (config('csp.additional_headers.x_content_type_options.enabled', true)) {
            $response->headers->set(
                'X-Content-Type-Options',
                config('csp.additional_headers.x_content_type_options.value', 'nosniff')
            );
        }

        // X-XSS-Protection: Enable browser XSS filter for legacy browsers
        if (config('csp.additional_headers.x_xss_protection.enabled', true)) {
            $response->headers->set(
                'X-XSS-Protection',
                config('csp.additional_headers.x_xss_protection.value', '1; mode=block')
            );
        }

        // Referrer-Policy: Control what referrer information is sent
        if (config('csp.additional_headers.referrer_policy.enabled', true)) {
            $response->headers->set(
                'Referrer-Policy',
                config('csp.additional_headers.referrer_policy.value', 'strict-origin-when-cross-origin')
            );
        }

        // Permissions-Policy (formerly Feature-Policy): Restrict browser features
        if (config('csp.additional_headers.permissions_policy.enabled', true)) {
            $permissionsPolicy = $this->buildPermissionsPolicy();
            if (!empty($permissionsPolicy)) {
                $response->headers->set('Permissions-Policy', $permissionsPolicy);
            }
        }

        // Strict-Transport-Security (HSTS): Force HTTPS
        $hstsConfig = config('csp.additional_headers.hsts', []);
        $hstsEnabled = $hstsConfig['enabled'] ?? true;
        $productionOnly = $hstsConfig['production_only'] ?? true;

        // Only add HSTS in production if production_only is true
        if ($hstsEnabled && (!$productionOnly || config('app.env') === 'production')) {
            $maxAge = $hstsConfig['max_age'] ?? 31536000;
            $includeSubdomains = $hstsConfig['include_subdomains'] ?? true;
            $preload = $hstsConfig['preload'] ?? true;

            $hstsValue = "max-age={$maxAge}";
            if ($includeSubdomains) {
                $hstsValue .= '; includeSubDomains';
            }
            if ($preload) {
                $hstsValue .= '; preload';
            }

            $response->headers->set('Strict-Transport-Security', $hstsValue);
        }
    }

    /**
     * Build Permissions-Policy header value from configuration
     *
     * @return string
     */
    private function buildPermissionsPolicy(): string
    {
        $features = config('csp.additional_headers.permissions_policy.features', []);

        $policies = [];
        foreach ($features as $feature => $allowedOrigins) {
            // Convert array keys with underscores to kebab-case
            $featureName = str_replace('_', '-', $feature);

            // If no origins allowed, use empty parentheses
            if (empty($allowedOrigins)) {
                $policies[] = "{$featureName}=()";
            } else {
                // Join origins with space
                $origins = implode(' ', $allowedOrigins);
                $policies[] = "{$featureName}=({$origins})";
            }
        }

        return implode(', ', $policies);
    }
}
