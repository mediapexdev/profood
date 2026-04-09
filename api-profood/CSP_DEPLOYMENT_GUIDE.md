# CSP Deployment Guide

This guide explains how to safely deploy Content Security Policy headers to production.

## Pre-Deployment Checklist

Before deploying CSP to production, ensure you have:

- [ ] Tested CSP headers in development environment
- [ ] Run all automated tests: `php artisan test`
- [ ] Verified external service connections still work
- [ ] Reviewed the CSP configuration in `config/csp.php`
- [ ] Tested with both mobile app and manager app frontends
- [ ] Documented any custom CSP requirements

## Deployment Strategy

### Phase 1: Report-Only Mode (Recommended)

Deploy CSP in report-only mode first to monitor violations without breaking functionality.

#### Steps:

1. **Enable Report-Only Mode**

   Add to `.env`:
   ```env
   CSP_REPORT_ONLY=true
   CSP_REPORT_URI=/api/csp-violation-report
   ```

2. **Create Violation Report Endpoint**

   Create a route to log CSP violations:

   ```php
   // routes/api.php
   Route::post('/csp-violation-report', function (Request $request) {
       \Log::warning('CSP Violation Report', [
           'report' => $request->all(),
           'user_agent' => $request->userAgent(),
           'ip' => $request->ip(),
       ]);

       return response('', 204);
   });
   ```

3. **Deploy to Production**

   ```bash
   git add .
   git commit -m "Add CSP in report-only mode"
   git push heroku main
   ```

4. **Monitor Violations**

   Check logs for CSP violations:
   ```bash
   heroku logs --tail | grep "CSP Violation"
   ```

5. **Review and Adjust**

   - Monitor for 1-2 weeks
   - Look for legitimate violations that need CSP policy adjustments
   - Update `config/csp.php` to allow necessary resources
   - Redeploy and continue monitoring

### Phase 2: Enforcement Mode

Once you're confident the CSP policy doesn't break functionality:

1. **Disable Report-Only Mode**

   Update `.env`:
   ```env
   CSP_REPORT_ONLY=false
   CSP_REPORT_URI=/api/csp-violation-report  # Keep for ongoing monitoring
   ```

2. **Deploy to Production**

   ```bash
   git add .
   git commit -m "Enable CSP enforcement mode"
   git push heroku main
   ```

3. **Continue Monitoring**

   Keep monitoring violation reports to catch edge cases.

## Testing in Production

### 1. Test API Endpoints

```bash
# Test that CSP headers are present
curl -I https://api.profood-app.com/api/get-box-types | grep -i "content-security-policy"

# Use the test script
./scripts/test-csp-headers.sh https://api.profood-app.com
```

### 2. Test Mobile App

1. Open the mobile app
2. Test key user flows:
   - Sign in/Sign up (Firebase authentication)
   - Browse products
   - Add items to cart
   - Place an order (PayTech payment)
   - View order history
3. Check browser console for CSP violations (if testing PWA)

### 3. Test Manager App

1. Open the manager app
2. Test admin operations:
   - Sign in (Firebase authentication)
   - View dashboard (ApexCharts)
   - Manage products
   - Process orders
   - View statistics
3. Check browser console for CSP violations

## Browser Console CSP Violations

CSP violations appear in the browser console like this:

```
Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self'".
```

### How to Fix Violations

1. **Identify the Resource**
   - Note the URL being blocked
   - Determine if it's necessary for functionality

2. **Update CSP Configuration**

   Edit `config/csp.php` to allow the resource:

   ```php
   'external_services' => [
       // ... existing services ...

       'new_service' => [
           'https://example.com',
       ],
   ],
   ```

3. **Redeploy**

## Common Issues and Solutions

### Issue: Firebase Authentication Fails

**Symptom:** Users cannot sign in, Firebase requests are blocked

**Solution:** Ensure all Firebase domains are in the CSP configuration:

```php
'firebase' => [
    'https://*.googleapis.com',
    'https://*.google.com',
    'https://*.firebaseio.com',
    'https://*.firebase.com',
    'https://*.firebaseapp.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
],
```

### Issue: PayTech Payment Fails

**Symptom:** Payment redirect doesn't work, PayTech webhook fails

**Solution:** Add PayTech domains to CSP:

```php
'paytech' => [
    'https://api.paytech.sn',
    'https://paytech.sn',
],
```

### Issue: Images Not Loading

**Symptom:** Product images or user avatars don't display

**Solution:** Add image CDN domains to `image_sources` in `config/csp.php`:

```php
'image_sources' => [
    "'self'",
    'data:',
    'https://your-cdn.com',
],
```

### Issue: Email Sending Fails

**Symptom:** Postmark API calls are blocked

**Solution:** Verify Postmark domain is allowed:

```php
'postmark' => [
    'https://api.postmarkapp.com',
],
```

### Issue: SMS Not Sent

**Symptom:** Twilio API calls fail

**Solution:** Add all Twilio domains:

```php
'twilio' => [
    'https://api.twilio.com',
    'https://*.twilio.com',
],
```

## Rolling Back CSP

If CSP causes critical issues in production:

### Quick Disable (Emergency)

1. Set in `.env`:
   ```env
   CSP_ENABLED=false
   ```

2. Clear config cache:
   ```bash
   heroku run php artisan config:clear
   ```

3. Investigate the issue in a non-production environment

### Partial Disable

Instead of completely disabling CSP, you can:

1. Switch to report-only mode:
   ```env
   CSP_REPORT_ONLY=true
   ```

2. Or disable specific directives in `config/csp.php`

## Environment Variables Summary

Add these to your production `.env`:

```env
# CSP Configuration
CSP_ENABLED=true                              # Enable/disable CSP
CSP_REPORT_ONLY=false                         # Report-only mode (set true initially)
CSP_REPORT_URI=/api/csp-violation-report      # Where to send violation reports
HSTS_ENABLED=true                             # Enable HSTS (HTTPS enforcement)
```

## Monitoring and Maintenance

### Regular Checks

1. **Weekly:** Review CSP violation reports in logs
2. **Monthly:** Test all API endpoints with the test script
3. **After Updates:** Re-test CSP when adding new external services
4. **Quarterly:** Review and update CSP policy for new security best practices

### Adding New External Services

When integrating a new external service (e.g., new payment gateway, analytics):

1. Add to `config/csp.php` under `external_services`
2. Test in development first
3. Deploy to production in report-only mode
4. Monitor for violations
5. Switch to enforcement mode

### CSP Policy Updates

Stay informed about CSP best practices:

- [MDN Web Docs - CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP - Content Security Policy](https://owasp.org/www-community/controls/Content_Security_Policy)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Performance Impact

CSP headers have minimal performance impact:

- **Header Size:** ~1-2 KB
- **Processing Time:** <1ms per request
- **Caching:** Browsers cache CSP policy
- **Network:** No additional requests needed

## Compliance and Auditing

CSP implementation helps meet:

- **OWASP Top 10:** A03:2021 – Injection
- **PCI DSS:** Requirement 6.5.7 (XSS prevention)
- **GDPR:** Article 32 (Security of processing)
- **ISO 27001:** A.14.2.5 (Secure system engineering)

Document CSP implementation in security audits and compliance reports.

## Support and Troubleshooting

If you encounter issues:

1. Check logs: `heroku logs --tail`
2. Review `CSP_IMPLEMENTATION.md` for detailed documentation
3. Test with `scripts/test-csp-headers.sh`
4. Check browser console for specific violation messages
5. Consult CSP resources linked in this guide

## Checklist for Production Deployment

### Initial Deployment (Report-Only)

- [ ] Set `CSP_REPORT_ONLY=true` in `.env`
- [ ] Set `CSP_REPORT_URI=/api/csp-violation-report`
- [ ] Create violation report endpoint
- [ ] Deploy to production
- [ ] Monitor logs for 1-2 weeks
- [ ] Test all user flows
- [ ] Adjust CSP policy as needed

### Full Enforcement

- [ ] Review violation reports
- [ ] Update CSP policy for any legitimate violations
- [ ] Set `CSP_REPORT_ONLY=false`
- [ ] Deploy to production
- [ ] Test all endpoints
- [ ] Monitor for any issues
- [ ] Keep violation reporting enabled
- [ ] Document any custom configurations

## Additional Resources

- [CSP Implementation Documentation](CSP_IMPLEMENTATION.md)
- [CSP Test Script](scripts/test-csp-headers.sh)
- [CSP Configuration](config/csp.php)
- [Environment Variables Example](.env.csp.example)
