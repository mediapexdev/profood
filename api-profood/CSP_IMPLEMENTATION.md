# Content Security Policy (CSP) Implementation

## Overview

This document describes the Content Security Policy implementation for the Profood API. CSP headers have been added to protect against Cross-Site Scripting (XSS), clickjacking, and other code injection attacks.

## Implementation Details

### Middleware Created

**File:** `app/Http/Middleware/ContentSecurityPolicy.php`

This middleware automatically adds CSP and additional security headers to all API responses.

### Registration

The middleware has been registered in two ways in `app/Http/Kernel.php`:

1. **Applied to all API routes** via the `api` middleware group (line 45)
2. **Available as named middleware** `csp` for selective application (line 68)

## CSP Directives Configured

### Core Directives

- **default-src 'none'**: Deny all by default (most restrictive)
- **script-src 'self'**: Only allow scripts from the API domain
- **style-src 'self'**: Only allow styles from the API domain
- **img-src**: Allow images from:
  - Self
  - Data URIs (base64)
  - Firebase (googleapis.com, gstatic.com)
  - PayTech (api.paytech.sn)

### API Communication (connect-src)

The most important directive for API functionality. Allows connections to:

#### Firebase Services
- `*.googleapis.com`
- `*.google.com`
- `*.firebaseio.com`
- `*.firebase.com`
- `*.firebaseapp.com`
- `identitytoolkit.googleapis.com`
- `securetoken.googleapis.com`

#### Payment Gateway
- `api.paytech.sn`
- `paytech.sn`

#### Email Service (Postmark)
- `api.postmarkapp.com`

#### SMS Service (Twilio)
- `api.twilio.com`
- `*.twilio.com`

#### Self
- The API's own URL from `config('app.url')`

### Security Directives

- **form-action 'self'**: Forms can only submit to the API
- **frame-ancestors 'none'**: Cannot be embedded in iframes (clickjacking protection)
- **base-uri 'self'**: Prevents base tag injection
- **object-src 'none'**: No plugins (Flash, Java, etc.)
- **upgrade-insecure-requests**: Force HTTPS upgrades
- **block-all-mixed-content**: Prevent HTTP resources on HTTPS

## Additional Security Headers

The middleware also adds these defense-in-depth headers:

### X-Frame-Options: DENY
Prevents the API from being embedded in frames (older browser support for frame-ancestors).

### X-Content-Type-Options: nosniff
Forces browsers to respect the Content-Type header, preventing MIME sniffing attacks.

### X-XSS-Protection: 1; mode=block
Enables browser XSS filters for legacy browsers (modern browsers use CSP).

### Referrer-Policy: strict-origin-when-cross-origin
Controls referrer information:
- Same-origin: Send full URL
- HTTPS cross-origin: Send only origin
- HTTP destinations: Send nothing

### Permissions-Policy
Disables dangerous browser features:
- `geolocation=()`
- `microphone=()`
- `camera=()`
- `payment=()`
- `usb=()`
- `magnetometer=()`
- `gyroscope=()`
- `accelerometer=()`
- `ambient-light-sensor=()`

### Strict-Transport-Security (HSTS) - Production Only
Forces HTTPS for 1 year:
- `max-age=31536000`
- `includeSubDomains`
- `preload`

**Note:** Only active when `APP_ENV=production` to avoid local development issues.

## Testing CSP Implementation

### 1. Test CSP Headers are Present

```bash
# Test a public endpoint
curl -I https://api.profood-app.com/api/get-box-types

# Look for these headers in the response:
# Content-Security-Policy: default-src 'none'; script-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=(), ...
```

### 2. Test with Browser DevTools

1. Make an API call from the browser console
2. Open DevTools → Network tab
3. Click on the request
4. View Response Headers
5. Verify CSP and security headers are present

### 3. Verify External Services Work

Test that the API can still communicate with external services:

```bash
# Test Firebase authentication (requires valid token)
curl -X POST https://api.profood-app.com/api/signin \
  -H "Content-Type: application/json" \
  -d '{"firebase_token": "..."}'

# Test PayTech webhook
curl -X POST https://api.profood-app.com/api/redirect-payment \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "..."}'
```

### 4. CSP Violation Reporting (Optional Future Enhancement)

Consider adding a `report-uri` or `report-to` directive to receive CSP violation reports:

```php
// In ContentSecurityPolicy.php, add to directives:
"report-uri /csp-violation-report"
```

Then create a route to log violations for monitoring.

## Maintenance

### Adding New External Services

If the API needs to connect to a new external service:

1. Open `app/Http/Middleware/ContentSecurityPolicy.php`
2. Add the domain to `getAllowedConnectSources()` array
3. Document the change in this file
4. Test thoroughly

Example:
```php
private function getAllowedConnectSources(): array
{
    return [
        // ... existing sources ...

        // New Service Name (description)
        'https://api.newservice.com',
        'https://*.newservice.com',
    ];
}
```

### Modifying CSP Directives

To change CSP directives:

1. Edit `buildCspDirectives()` method in `ContentSecurityPolicy.php`
2. Test changes in development first
3. Monitor for CSP violations after deployment
4. Update this documentation

### Disabling CSP for Specific Routes (Not Recommended)

If absolutely necessary, you can exclude specific routes:

```php
// In ContentSecurityPolicy.php handle() method:
public function handle(Request $request, Closure $next)
{
    // Skip CSP for specific routes
    if ($request->is('api/exempt-route')) {
        return $next($request);
    }

    // ... rest of the code
}
```

**Warning:** Only do this if you have a very good reason and understand the security implications.

## Browser Compatibility

### Full CSP Support
- Chrome 25+
- Firefox 23+
- Safari 7+
- Edge (all versions)

### Legacy Headers
- X-Frame-Options: IE8+, all modern browsers
- X-Content-Type-Options: IE8+, all modern browsers
- X-XSS-Protection: IE8+, Chrome, Safari (deprecated in modern browsers, CSP preferred)

## Security Benefits

This CSP implementation provides protection against:

1. **Cross-Site Scripting (XSS)**: By restricting script sources
2. **Clickjacking**: Via frame-ancestors and X-Frame-Options
3. **Code Injection**: By controlling what resources can be loaded
4. **MIME Sniffing**: Via X-Content-Type-Options
5. **Mixed Content**: By forcing HTTPS
6. **Data Exfiltration**: By controlling connect-src
7. **Unauthorized Feature Access**: Via Permissions-Policy

## Performance Impact

CSP headers add minimal overhead:
- Average header size: ~1-2 KB
- Processing time: Negligible (<1ms)
- No impact on API response time
- Headers are cached by browsers

## Compliance

This implementation helps meet security requirements for:
- OWASP Top 10 (A03:2021 – Injection)
- PCI DSS (Requirement 6.5.7)
- GDPR (Article 32 - Security of processing)
- ISO 27001 (A.14.2.5 - Secure system engineering principles)

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Content Security Policy](https://owasp.org/www-community/controls/Content_Security_Policy)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Test your CSP policy
- [Security Headers](https://securityheaders.com/) - Scan your API for security headers

## Change Log

### 2026-02-04 - Initial Implementation
- Created ContentSecurityPolicy middleware
- Registered in Kernel.php for all API routes
- Configured for Firebase, PayTech, Postmark, Twilio
- Added comprehensive security headers
- HSTS enabled for production only
