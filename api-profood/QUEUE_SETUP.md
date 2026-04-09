# Queue Configuration Guide

## Overview

The Profood API has been configured to use Laravel's queue system for asynchronous email processing. This prevents email sending from blocking HTTP requests and improves application responsiveness.

## Configuration

### Queue Driver: Database

The application uses the `database` queue driver, which stores queued jobs in the PostgreSQL database. This is simpler than Redis and works well with Heroku's PostgreSQL add-on.

**Configuration file:** `config/queue.php`
- Driver: `database`
- Table: `jobs`
- Failed jobs table: `failed_jobs`
- Retry after: 90 seconds
- Default queue: `default`

### Environment Variables

Add to your `.env` file:

```env
QUEUE_CONNECTION=database
```

For development, you can temporarily use `sync` to process jobs immediately:

```env
QUEUE_CONNECTION=sync
```

## Database Setup

### Run Migrations

The following migrations are required:

```bash
# Run all migrations (includes jobs and failed_jobs tables)
php artisan migrate
```

This creates two tables:
- `jobs` - Stores pending and processing jobs
- `failed_jobs` - Stores jobs that failed after all retry attempts

## Queued Email Classes

The following Mailable classes implement `ShouldQueue` and will be processed asynchronously:

1. **OrderAcknowledgmentEmail** - Sent to customers when order is confirmed
2. **OrderNotificationEmail** - Sent to admin when new order is placed
3. **CustomerOrderStatusNotificationEmail** - Sent to customers when order status changes
4. **CustomerNotificationEmail** - General notification emails to customers

## Running the Queue Worker

### Local Development

Start the queue worker in a separate terminal:

```bash
php artisan queue:work
```

**Options:**
```bash
# With specific configuration
php artisan queue:work --sleep=3 --tries=3 --max-time=3600

# Process specific queue
php artisan queue:work --queue=default

# Process jobs once and exit (useful for testing)
php artisan queue:work --once

# Stop gracefully after current job
php artisan queue:restart
```

**Important:** The queue worker is a long-running process. After code changes, you must restart it:

```bash
php artisan queue:restart
```

### Production (Heroku)

The `Procfile` defines two process types:

```
web: vendor/bin/heroku-php-apache2 public/
worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

**Enable the worker dyno on Heroku:**

```bash
# Scale up the worker dyno (1 worker instance)
heroku ps:scale worker=1

# Check dyno status
heroku ps

# View worker logs
heroku logs --ps worker --tail
```

**Worker Options Explained:**
- `--sleep=3` - Wait 3 seconds between polling for jobs (reduces CPU usage)
- `--tries=3` - Retry failed jobs up to 3 times before marking as failed
- `--max-time=3600` - Restart worker after 1 hour (prevents memory leaks)

**Note:** Worker dynos are billable on Heroku. A single worker instance is sufficient for most use cases. Monitor your queue length and adjust if needed.

## Monitoring and Debugging

### Check Queue Status

```bash
# View pending jobs count
php artisan queue:monitor

# List failed jobs
php artisan queue:failed

# View job details
php artisan queue:failed {id}
```

### Retry Failed Jobs

```bash
# Retry a specific failed job
php artisan queue:retry {id}

# Retry all failed jobs
php artisan queue:retry all

# Flush all failed jobs (delete without retrying)
php artisan queue:flush
```

### Database Inspection

```sql
-- Check pending jobs
SELECT * FROM jobs ORDER BY id DESC LIMIT 10;

-- Check failed jobs
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;

-- Count jobs by queue
SELECT queue, COUNT(*) FROM jobs GROUP BY queue;
```

## Performance Considerations

### Job Payload Size

The `jobs.payload` column is `longText`, which can store large data. However, keep payloads small for better performance:

- **Good:** Pass Order ID, load full Order model in job
- **Bad:** Serialize entire Order with all relationships

The current implementation passes Order models directly, which is acceptable since Laravel serializes them efficiently.

### Queue Workers

For production, consider:
- **1 worker** - Sufficient for ~100 emails/hour
- **2-3 workers** - For high-traffic periods (>500 emails/hour)
- **Scaling** - Monitor queue depth and adjust worker count

### Failed Job Cleanup

Failed jobs accumulate over time. Implement periodic cleanup:

```bash
# Delete failed jobs older than 7 days (manual)
php artisan queue:prune-failed --hours=168
```

Or add a scheduled task in `app/Console/Kernel.php`:

```php
$schedule->command('queue:prune-failed --hours=168')->daily();
```

## Testing

### Test Queue Jobs Locally

1. Set `QUEUE_CONNECTION=database` in `.env`
2. Start queue worker: `php artisan queue:work`
3. Trigger an action that sends email (e.g., create an order)
4. Watch worker logs to see job processing

### Verify Email Sending

Check your mail logs:
- **Postmark:** https://account.postmarkapp.com/servers/{server}/streams/{stream}/messages
- **Laravel Log:** `storage/logs/laravel.log` (if using `log` mailer for development)

## Troubleshooting

### Jobs Not Processing

**Symptom:** Jobs appear in `jobs` table but never get processed.

**Solutions:**
1. Check if queue worker is running: `ps aux | grep "queue:work"`
2. Restart worker: `php artisan queue:restart`
3. Check worker logs for errors: `heroku logs --ps worker --tail` (Heroku)
4. Verify `QUEUE_CONNECTION=database` in `.env`

### Jobs Failing Silently

**Symptom:** Jobs marked as failed without error details.

**Solutions:**
1. Check `failed_jobs` table for exception details
2. Enable debug mode: `APP_DEBUG=true` (development only)
3. Check email credentials (Postmark token, SMTP settings)
4. Test email sending manually:
   ```php
   Mail::to('test@example.com')->send(new OrderAcknowledgmentEmail($order));
   ```

### Memory Issues

**Symptom:** Worker crashes with "out of memory" errors.

**Solutions:**
1. Reduce `--max-time` to restart worker more frequently
2. Use `--max-jobs=1000` to restart after processing X jobs
3. Check for memory leaks in job code
4. Increase worker memory limit: `php -d memory_limit=512M artisan queue:work`

### Database Connection Timeout

**Symptom:** Worker loses database connection after idle period.

**Solutions:**
1. Set `retry_after` in `config/queue.php` to a lower value (e.g., 60)
2. Use `--timeout=60` flag to force job timeout
3. Configure PostgreSQL connection pooling (Heroku)

## Migration Guide

### Switching from Sync to Database Queue

1. **Update environment:**
   ```bash
   # Update .env
   QUEUE_CONNECTION=database
   ```

2. **Run migrations:**
   ```bash
   php artisan migrate
   ```

3. **Start worker (local):**
   ```bash
   php artisan queue:work --sleep=3 --tries=3
   ```

4. **Deploy to Heroku:**
   ```bash
   git push heroku main
   heroku ps:scale worker=1
   ```

5. **Test email sending:**
   - Place a test order
   - Check Postmark activity stream
   - Monitor worker logs

### Reverting to Synchronous Processing

If issues arise, temporarily revert to synchronous processing:

```bash
# Update .env
QUEUE_CONNECTION=sync

# Restart application
php artisan config:cache

# On Heroku
heroku config:set QUEUE_CONNECTION=sync
heroku ps:scale worker=0
```

## Best Practices

1. **Always run queue worker in production** when `QUEUE_CONNECTION=database`
2. **Monitor failed_jobs table** and investigate failures
3. **Keep job payloads small** - pass IDs instead of full models when possible
4. **Set reasonable timeouts** to prevent stuck jobs
5. **Use queue monitoring tools** for production (Laravel Horizon for Redis, or custom dashboard)
6. **Log job failures** for debugging
7. **Test email sending** after deploying queue changes
8. **Scale workers** based on queue depth and processing time

## Additional Resources

- [Laravel Queue Documentation](https://laravel.com/docs/9.x/queues)
- [Heroku Worker Dynos](https://devcenter.heroku.com/articles/background-jobs-queueing)
- [Laravel Queue Monitoring](https://laravel.com/docs/9.x/queues#monitoring-your-queues)
- [Postmark Integration](https://postmarkapp.com/developer)
