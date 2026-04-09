# Queue Worker Deployment Checklist

## Overview

This checklist guides you through deploying the queue worker system for asynchronous email processing.

## Pre-Deployment Checklist

- [ ] Review all code changes (see "Files Modified" section below)
- [ ] Understand queue worker concepts (read `QUEUE_SETUP.md`)
- [ ] Backup production database (Heroku: `heroku pg:backups:capture`)
- [ ] Test locally before deploying to production

## Local Testing Steps

### 1. Update Local Environment

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood

# Update .env file
# Change: QUEUE_CONNECTION=sync
# To:     QUEUE_CONNECTION=database
nano .env
```

### 2. Run Database Migration

```bash
# This creates the 'jobs' table
php artisan migrate

# Verify table was created
php artisan tinker
>>> \DB::select('SELECT * FROM jobs LIMIT 1');
>>> exit
```

### 3. Start Queue Worker

Open a new terminal window and start the worker:

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood
php artisan queue:work --sleep=3 --tries=3
```

Keep this terminal open. You should see:

```
[YYYY-MM-DD HH:MM:SS][<job_id>] Processing: App\Mail\OrderAcknowledgmentEmail
[YYYY-MM-DD HH:MM:SS][<job_id>] Processed:  App\Mail\OrderAcknowledgmentEmail
```

### 4. Test Email Sending

In another terminal:

```bash
# Start Laravel development server
php artisan serve
```

Then test by:
1. Using the mobile app to place an order, OR
2. Using the API directly to trigger an email-sending endpoint

Watch the queue worker terminal for job processing logs.

### 5. Verify Email Delivery

Check that emails were actually sent:
- **Postmark:** Login to https://account.postmarkapp.com and check the activity stream
- **Logs:** Check `storage/logs/laravel.log` for any errors

### 6. Test Failed Job Handling

Intentionally break email sending (e.g., invalid Postmark token):

```bash
# In .env, set an invalid token
POSTMARK_TOKEN=invalid_token

# Restart queue worker
php artisan queue:restart
php artisan queue:work --sleep=3 --tries=3
```

Trigger an email and verify:

```bash
# Check failed jobs
php artisan queue:failed

# You should see the failed job with error details
```

Restore valid token and retry:

```bash
# Restore valid POSTMARK_TOKEN in .env
php artisan queue:retry all
```

## Production Deployment Steps

### 1. Commit Changes (if ready)

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood

git add .
git commit -m "Configure database queue worker for asynchronous email processing

- Add jobs table migration for queue storage
- Implement ShouldQueue on all Mailable classes
- Update Procfile to include worker process
- Update .env.example with database queue configuration
- Add comprehensive queue setup documentation"
```

### 2. Deploy to Heroku

```bash
# Push to Heroku
git push heroku main

# Or if using a different branch
git push heroku your-branch:main
```

### 3. Run Migration on Heroku

```bash
# Run the migration to create jobs table
heroku run php artisan migrate

# Verify migration succeeded
heroku run php artisan tinker
>>> \DB::select('SELECT * FROM jobs LIMIT 1');
>>> exit
```

### 4. Update Environment Variable

```bash
# Set queue connection to database
heroku config:set QUEUE_CONNECTION=database

# Verify it was set
heroku config:get QUEUE_CONNECTION
```

### 5. Scale Up Worker Dyno

```bash
# Enable 1 worker instance
heroku ps:scale worker=1

# Verify worker is running
heroku ps

# Expected output:
# === worker (Hobby): php artisan queue:work --sleep=3 --tries=3 --max-time=3600 (1)
# worker.1: up YYYY/MM/DD HH:MM:SS
```

### 6. Monitor Worker Logs

```bash
# Watch worker logs in real-time
heroku logs --ps worker --tail

# You should see queue worker startup message:
# [YYYY-MM-DD HH:MM:SS] Processing jobs...
```

### 7. Test in Production

1. Place a test order using the mobile app
2. Monitor worker logs: `heroku logs --ps worker --tail`
3. Check Postmark activity stream for email delivery
4. Verify customer receives order confirmation email

### 8. Monitor Queue Health

```bash
# Check queue status
heroku run php artisan queue:monitor

# Check for failed jobs
heroku run php artisan queue:failed

# View application logs for errors
heroku logs --tail
```

## Post-Deployment Monitoring

### Daily Checks (First Week)

- [ ] Check failed jobs: `heroku run php artisan queue:failed`
- [ ] Review worker uptime: `heroku ps`
- [ ] Check Postmark delivery rates
- [ ] Monitor response times (should improve without synchronous email sending)

### Weekly Maintenance

- [ ] Review failed jobs and investigate patterns
- [ ] Check database size (jobs table growth)
- [ ] Review worker dyno costs
- [ ] Prune old failed jobs: `heroku run php artisan queue:prune-failed --hours=168`

## Rollback Plan

If issues arise, revert to synchronous email processing:

### Quick Rollback (No Deployment)

```bash
# Disable queue worker
heroku ps:scale worker=0

# Switch to sync processing
heroku config:set QUEUE_CONNECTION=sync

# Verify change
heroku restart
heroku config:get QUEUE_CONNECTION
```

This immediately reverts to the previous behavior without requiring a new deployment.

### Full Rollback (Code Revert)

```bash
# Revert git commit
git revert HEAD
git push heroku main

# Scale down worker
heroku ps:scale worker=0

# Set sync mode
heroku config:set QUEUE_CONNECTION=sync
```

## Troubleshooting Common Issues

### Issue 1: Worker Not Processing Jobs

**Symptoms:**
- Jobs accumulating in `jobs` table
- Emails not being sent
- No worker logs

**Solutions:**
```bash
# Check worker status
heroku ps

# If worker is down, scale up
heroku ps:scale worker=1

# If worker is up but idle, check logs
heroku logs --ps worker --tail

# Restart worker
heroku restart worker
```

### Issue 2: Jobs Failing Repeatedly

**Symptoms:**
- Multiple failed jobs in `failed_jobs` table
- Same error recurring

**Solutions:**
```bash
# Check failed jobs
heroku run php artisan queue:failed

# View specific error details
heroku run php artisan queue:failed {job-id}

# Common causes:
# - Invalid Postmark token
# - Database connection timeout
# - Missing Order data

# Fix underlying issue, then retry
heroku run php artisan queue:retry all
```

### Issue 3: Worker Memory Issues

**Symptoms:**
- Worker dyno crashing
- "Out of memory" errors in logs

**Solutions:**
```bash
# Reduce max-time to restart more frequently
# Update Procfile: --max-time=1800 (30 minutes)

# Or upgrade worker dyno type
heroku ps:resize worker=standard-1x

# Or add max-jobs limit
# Update Procfile: --max-jobs=500
```

### Issue 4: Database Connection Timeout

**Symptoms:**
- "Lost connection to MySQL server" (even though using PostgreSQL)
- Worker stops processing after idle period

**Solutions:**
```bash
# Add timeout to worker command
# Update Procfile: --timeout=60

# Or restart worker more frequently
# Update Procfile: --max-time=1800
```

## Files Modified

This deployment includes changes to the following files:

### 1. Database Migration
- `database/migrations/2026_02_04_151858_create_jobs_table.php` (NEW)
  - Creates `jobs` table for queue storage

### 2. Mailable Classes (4 files)
- `app/Mail/OrderAcknowledgmentEmail.php`
- `app/Mail/OrderNotificationEmail.php`
- `app/Mail/CustomerOrderStatusNotificationEmail.php`
- `app/Mail/CustomerNotificationEmail.php`
  - Added `implements ShouldQueue` to each class

### 3. Environment Configuration
- `.env.example`
  - Changed `QUEUE_CONNECTION=sync` to `QUEUE_CONNECTION=database`
  - Added comments explaining queue options

### 4. Heroku Configuration
- `Procfile`
  - Added worker process: `worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600`

### 5. Documentation (NEW)
- `QUEUE_SETUP.md` - Comprehensive queue worker documentation
- `DEPLOYMENT_CHECKLIST.md` - This file

## Cost Considerations

### Heroku Pricing

**Worker Dyno Costs:**
- **Hobby:** $7/month (512MB RAM, sleeps after 30min inactivity)
- **Standard-1X:** $25/month (512MB RAM, never sleeps)
- **Standard-2X:** $50/month (1GB RAM)

**Recommendations:**
- Start with **Standard-1X** ($25/month) for production
- Hobby dynos sleep and may delay email processing
- Monitor usage and scale up only if needed

**Cost Optimization:**
- Use 1 worker for up to ~500 emails/hour
- Scale to 2 workers only during high-traffic periods
- Consider scheduled workers (process queue at specific times)

## Performance Expectations

### Before Queue Worker (Sync)
- Order creation: 2-4 seconds (includes email sending)
- Emails sent: Immediately, blocking request
- User experience: Noticeable delay after placing order

### After Queue Worker (Async)
- Order creation: 300-800ms (no email blocking)
- Emails sent: Within 5-10 seconds (queued)
- User experience: Instant response, emails arrive shortly after

### Metrics to Monitor
- **Queue depth:** Should stay near 0 (jobs processed quickly)
- **Failed jobs:** Should be < 1% of total jobs
- **Email delivery time:** < 30 seconds from order creation
- **API response time:** 50-70% faster for email-sending endpoints

## Success Criteria

Deployment is successful when:

- [ ] Worker dyno is running on Heroku
- [ ] Test order triggers email within 30 seconds
- [ ] Worker logs show job processing
- [ ] No failed jobs accumulating
- [ ] API response times improved
- [ ] Postmark shows successful email delivery
- [ ] Customer and admin receive emails correctly

## Support Contacts

- **Laravel Queue Issues:** https://laravel.com/docs/9.x/queues
- **Heroku Worker Dynos:** https://devcenter.heroku.com/articles/background-jobs-queueing
- **Postmark Support:** https://postmarkapp.com/support

## Next Steps After Deployment

1. **Monitor for 48 hours** - Watch for any queue or email issues
2. **Document any issues** - Add to troubleshooting guide if needed
3. **Optimize worker settings** - Adjust sleep, tries, max-time based on performance
4. **Consider queue monitoring** - Add Laravel Horizon or custom dashboard
5. **Set up alerts** - Monitor failed jobs and worker downtime
6. **Review costs** - Ensure worker dyno cost is justified by performance gains

## Revision History

- **2026-02-04:** Initial queue worker configuration
  - Database driver with jobs table
  - All Mailable classes implement ShouldQueue
  - Heroku worker process in Procfile
  - Comprehensive documentation
