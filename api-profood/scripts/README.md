# Scripts Directory

This directory contains utility scripts for the Profood API.

## Available Scripts

### test-csp-headers.sh

Tests that Content Security Policy (CSP) and other security headers are properly configured on the API.

**Usage:**

```bash
# Test local development server
./scripts/test-csp-headers.sh http://localhost:8000

# Test production API
./scripts/test-csp-headers.sh https://api.profood-app.com

# Default (localhost:8000)
./scripts/test-csp-headers.sh
```

**What it tests:**

- Presence of Content-Security-Policy header
- X-Frame-Options header (clickjacking protection)
- X-Content-Type-Options header (MIME sniffing protection)
- X-XSS-Protection header (legacy XSS protection)
- Referrer-Policy header
- Permissions-Policy header
- Critical CSP directives (frame-ancestors, upgrade-insecure-requests, etc.)
- External service allowances (Firebase, PayTech, Twilio, Postmark)
- Absence of unsafe CSP directives (unsafe-inline, unsafe-eval)
- HSTS header (production only)
- Consistency across multiple endpoints

**Example output:**

```
======================================
Content Security Policy Headers Test
======================================
API URL: http://localhost:8000

Testing Public Endpoints
========================

Testing endpoint: /api/get-box-types
Looking for header: Content-Security-Policy
✓ Header found:
  Content-Security-Policy: default-src 'none'; script-src 'self'; ...
✓ Contains expected value: default-src 'none'

...
```

## Creating New Scripts

When adding new scripts to this directory:

1. Use descriptive names (e.g., `test-feature-name.sh`, `deploy-to-environment.sh`)
2. Make scripts executable: `chmod +x scripts/your-script.sh`
3. Add usage instructions in this README
4. Include help text in the script itself (use `--help` flag)
5. Use proper error handling and exit codes
6. Add color-coded output for better readability
