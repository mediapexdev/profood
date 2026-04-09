<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Content Security Policy Middleware Test
 *
 * Tests that CSP and security headers are correctly applied to API responses.
 * These tests verify defense-in-depth security measures against XSS and other attacks.
 */
class ContentSecurityPolicyTest extends TestCase
{
    /**
     * Test that CSP header is present on public API endpoints
     *
     * @return void
     */
    public function test_csp_header_is_present_on_public_endpoints()
    {
        // Test a public endpoint that doesn't require authentication
        $response = $this->getJson('/api/get-box-types');

        // Assert that Content-Security-Policy header exists
        $response->assertHeader('Content-Security-Policy');

        // Get the CSP header value
        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Assert key CSP directives are present
        $this->assertStringContainsString("default-src 'none'", $cspHeader);
        $this->assertStringContainsString("script-src 'self'", $cspHeader);
        $this->assertStringContainsString("frame-ancestors 'none'", $cspHeader);
    }

    /**
     * Test that CSP header includes Firebase domains
     *
     * @return void
     */
    public function test_csp_allows_firebase_connections()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Firebase domains should be in connect-src directive
        $this->assertStringContainsString('connect-src', $cspHeader);
        $this->assertStringContainsString('googleapis.com', $cspHeader);
        $this->assertStringContainsString('firebase.com', $cspHeader);
        $this->assertStringContainsString('identitytoolkit.googleapis.com', $cspHeader);
    }

    /**
     * Test that CSP header includes PayTech domains
     *
     * @return void
     */
    public function test_csp_allows_paytech_connections()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // PayTech payment gateway should be allowed
        $this->assertStringContainsString('paytech.sn', $cspHeader);
    }

    /**
     * Test that CSP header includes Twilio domains
     *
     * @return void
     */
    public function test_csp_allows_twilio_connections()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Twilio SMS service should be allowed
        $this->assertStringContainsString('twilio.com', $cspHeader);
    }

    /**
     * Test that CSP header includes Postmark domains
     *
     * @return void
     */
    public function test_csp_allows_postmark_connections()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Postmark email service should be allowed
        $this->assertStringContainsString('postmarkapp.com', $cspHeader);
    }

    /**
     * Test that X-Frame-Options header is present
     *
     * This prevents clickjacking attacks by disallowing iframe embedding
     *
     * @return void
     */
    public function test_x_frame_options_header_is_present()
    {
        $response = $this->getJson('/api/get-box-types');

        $response->assertHeader('X-Frame-Options', 'DENY');
    }

    /**
     * Test that X-Content-Type-Options header is present
     *
     * This prevents MIME sniffing attacks
     *
     * @return void
     */
    public function test_x_content_type_options_header_is_present()
    {
        $response = $this->getJson('/api/get-box-types');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Test that X-XSS-Protection header is present
     *
     * Enables browser XSS filter for legacy browsers
     *
     * @return void
     */
    public function test_x_xss_protection_header_is_present()
    {
        $response = $this->getJson('/api/get-box-types');

        $response->assertHeader('X-XSS-Protection', '1; mode=block');
    }

    /**
     * Test that Referrer-Policy header is present
     *
     * Controls referrer information leakage
     *
     * @return void
     */
    public function test_referrer_policy_header_is_present()
    {
        $response = $this->getJson('/api/get-box-types');

        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    /**
     * Test that Permissions-Policy header is present
     *
     * Restricts browser features and APIs
     *
     * @return void
     */
    public function test_permissions_policy_header_is_present()
    {
        $response = $this->getJson('/api/get-box-types');

        $response->assertHeader('Permissions-Policy');

        $permissionsPolicy = $response->headers->get('Permissions-Policy');

        // Assert dangerous features are disabled
        $this->assertStringContainsString('geolocation=()', $permissionsPolicy);
        $this->assertStringContainsString('camera=()', $permissionsPolicy);
        $this->assertStringContainsString('microphone=()', $permissionsPolicy);
    }

    /**
     * Test that CSP headers are applied to protected endpoints
     *
     * @return void
     */
    public function test_csp_header_is_present_on_protected_endpoints()
    {
        // Test an endpoint that requires authentication (will get 401, but headers should still be present)
        $response = $this->getJson('/api/user');

        // Even on error responses, security headers should be present
        $response->assertHeader('Content-Security-Policy');
        $response->assertHeader('X-Frame-Options');
        $response->assertHeader('X-Content-Type-Options');
    }

    /**
     * Test that HSTS header is NOT present in non-production environments
     *
     * HSTS can cause issues in local development, so it should only be active in production
     *
     * @return void
     */
    public function test_hsts_header_not_present_in_development()
    {
        // In test environment (non-production), HSTS should not be present
        $response = $this->getJson('/api/get-box-types');

        // If APP_ENV is not production, HSTS should not be set
        if (config('app.env') !== 'production') {
            $this->assertFalse($response->headers->has('Strict-Transport-Security'));
        }
    }

    /**
     * Test that CSP does not allow 'unsafe-inline' scripts
     *
     * This is critical for XSS prevention
     *
     * @return void
     */
    public function test_csp_does_not_allow_unsafe_inline_scripts()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Assert that 'unsafe-inline' is NOT present in script-src
        $this->assertStringNotContainsString("'unsafe-inline'", $cspHeader);
    }

    /**
     * Test that CSP does not allow 'unsafe-eval' scripts
     *
     * This prevents eval() and similar dangerous functions
     *
     * @return void
     */
    public function test_csp_does_not_allow_unsafe_eval()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        // Assert that 'unsafe-eval' is NOT present
        $this->assertStringNotContainsString("'unsafe-eval'", $cspHeader);
    }

    /**
     * Test that CSP includes upgrade-insecure-requests directive
     *
     * This forces HTTP resources to be requested over HTTPS
     *
     * @return void
     */
    public function test_csp_includes_upgrade_insecure_requests()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString('upgrade-insecure-requests', $cspHeader);
    }

    /**
     * Test that CSP includes block-all-mixed-content directive
     *
     * This prevents loading HTTP resources on HTTPS pages
     *
     * @return void
     */
    public function test_csp_includes_block_all_mixed_content()
    {
        $response = $this->getJson('/api/get-box-types');

        $cspHeader = $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString('block-all-mixed-content', $cspHeader);
    }

    /**
     * Test that multiple endpoints have consistent CSP headers
     *
     * Ensures CSP is applied consistently across all API routes
     *
     * @return void
     */
    public function test_consistent_csp_across_multiple_endpoints()
    {
        // Test multiple endpoints
        $endpoints = [
            '/api/get-box-types',
            '/api/get-categories',
            '/api/get-slices',
        ];

        $cspHeaders = [];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $cspHeaders[] = $response->headers->get('Content-Security-Policy');
        }

        // All endpoints should have the same CSP header
        $this->assertCount(count($endpoints), $cspHeaders);
        $this->assertEquals($cspHeaders[0], $cspHeaders[1]);
        $this->assertEquals($cspHeaders[1], $cspHeaders[2]);
    }
}
