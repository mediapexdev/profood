# Laravel 9 → 11 Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate api-profood from Laravel 9.19 to Laravel 11 with the new slim application structure.

**Architecture:** Direct migration on a dedicated branch. Update composer dependencies, restructure bootstrap/app.php (remove Kernel.php files), migrate intervention/image v2→v3 (11 usages across 4 controllers), update PHPUnit config, add smoke tests.

**Tech Stack:** Laravel 11, PHP ^8.2, intervention/image ^3, PHPUnit ^10, PostgreSQL

---

### Task 1: Create migration branch and backup

**Files:**
- None (git operations only)

**Step 1: Create a new branch from main**

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood
git checkout main
git pull origin main
git checkout -b feature/laravel-11-migration
```

**Step 2: Verify clean working state**

```bash
git status
```

Expected: Clean working tree, on branch `feature/laravel-11-migration`

---

### Task 2: Write smoke tests (baseline before migration)

**Files:**
- Create: `tests/Feature/SmokeTest.php`

**Step 1: Write the smoke tests**

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SmokeTest extends TestCase
{
    /**
     * Test public product endpoint returns 200.
     */
    public function test_get_box_types_returns_200(): void
    {
        $response = $this->getJson('/api/get-box-types');
        $response->assertStatus(200);
    }

    /**
     * Test public categories endpoint returns 200.
     */
    public function test_get_categories_returns_200(): void
    {
        $response = $this->getJson('/api/get-categories');
        $response->assertStatus(200);
    }

    /**
     * Test public slices endpoint returns 200.
     */
    public function test_get_slices_returns_200(): void
    {
        $response = $this->getJson('/api/get-slices');
        $response->assertStatus(200);
    }

    /**
     * Test unauthenticated access to protected route returns 401.
     */
    public function test_protected_route_returns_401_without_auth(): void
    {
        $response = $this->getJson('/api/get-orders');
        $response->assertStatus(401);
    }

    /**
     * Test CSP headers are present on API responses.
     */
    public function test_csp_headers_present(): void
    {
        $response = $this->getJson('/api/get-box-types');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Test 404 returns JSON for API routes.
     */
    public function test_api_404_returns_json(): void
    {
        $response = $this->getJson('/api/nonexistent-endpoint');
        $response->assertStatus(404);
        $response->assertJson(['message' => 'Ressource introuvable']);
    }
}
```

**Step 2: Run tests to verify baseline**

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood
php artisan test tests/Feature/SmokeTest.php --verbose
```

Expected: All tests PASS (if local DB is available) or at minimum the 404/401 tests pass.

**Step 3: Commit baseline tests**

```bash
git add tests/Feature/SmokeTest.php
git commit -m "Add smoke tests as baseline before Laravel 11 migration"
```

---

### Task 3: Update composer.json dependencies

**Files:**
- Modify: `composer.json`

**Step 1: Update all version constraints**

Update `composer.json` with the following changes:

```json
{
    "require": {
        "php": "^8.2",
        "ext-gd": "*",
        "guzzlehttp/guzzle": "^7.2",
        "intervention/image": "^3.0",
        "laravel/framework": "^11.0",
        "laravel/sanctum": "^4.0",
        "laravel/tinker": "^2.9",
        "symfony/http-client": "^7.0",
        "symfony/postmark-mailer": "^7.0",
        "twilio/sdk": "^8.1"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pint": "^1.0",
        "laravel/sail": "^1.26",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.0",
        "phpunit/phpunit": "^11.0",
        "spatie/laravel-ignition": "^2.0"
    }
}
```

**Do NOT run `composer update` yet.** We need to restructure bootstrap files first.

**Step 2: Commit dependency changes**

```bash
git add composer.json
git commit -m "Update dependency versions for Laravel 11 migration"
```

---

### Task 4: Restructure bootstrap/app.php (new L11 slim structure)

**Files:**
- Modify: `bootstrap/app.php` (complete rewrite)

**Step 1: Replace bootstrap/app.php with L11 structure**

The current file (`bootstrap/app.php:1-56`) registers Kernel and ExceptionHandler singletons. Laravel 11 replaces this with a fluent configuration.

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Append custom middleware to the API group
        // (replaces Kernel.php $middlewareGroups['api'])
        $middleware->api(append: [
            \App\Http\Middleware\ContentSecurityPolicy::class,
        ]);

        // Register named/aliased middleware
        // (replaces Kernel.php $routeMiddleware)
        $middleware->alias([
            'check.token.expiration' => \App\Http\Middleware\CheckApiTokenExpiration::class,
            'csp' => \App\Http\Middleware\ContentSecurityPolicy::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Migrated from app/Exceptions/Handler.php:52-60
        $exceptions->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Ressource introuvable',
                ], 404);
            }
        });
    })
    ->create();
```

**Step 2: Commit**

```bash
git add bootstrap/app.php
git commit -m "Restructure bootstrap/app.php for Laravel 11 slim structure"
```

---

### Task 5: Migrate AppServiceProvider (absorb rate limiting from RouteServiceProvider)

**Files:**
- Modify: `app/Providers/AppServiceProvider.php`

**Step 1: Add rate limiting to AppServiceProvider::boot()**

The rate limiting currently in `RouteServiceProvider.php:46-51` moves here. Route registration is now handled by `bootstrap/app.php`.

```php
<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(300)->by($request->user()?->id ?: $request->ip());
        });
    }
}
```

**Step 2: Commit**

```bash
git add app/Providers/AppServiceProvider.php
git commit -m "Move rate limiting to AppServiceProvider for Laravel 11"
```

---

### Task 6: Remove files replaced by L11 structure

**Files:**
- Delete: `app/Http/Kernel.php`
- Delete: `app/Console/Kernel.php`
- Delete: `app/Exceptions/Handler.php`
- Delete: `app/Providers/RouteServiceProvider.php`
- Delete: `app/Providers/EventServiceProvider.php`
- Delete: `tests/CreatesApplication.php`
- Delete: L9 middleware stubs (replaced by framework defaults in L11):
  - `app/Http/Middleware/Authenticate.php`
  - `app/Http/Middleware/EncryptCookies.php`
  - `app/Http/Middleware/PreventRequestsDuringMaintenance.php`
  - `app/Http/Middleware/RedirectIfAuthenticated.php`
  - `app/Http/Middleware/TrimStrings.php`
  - `app/Http/Middleware/TrustHosts.php`
  - `app/Http/Middleware/TrustProxies.php`
  - `app/Http/Middleware/ValidateSignature.php`
  - `app/Http/Middleware/VerifyCsrfToken.php`

**Step 1: Remove the files**

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood
rm app/Http/Kernel.php
rm app/Console/Kernel.php
rm app/Exceptions/Handler.php
rm app/Providers/RouteServiceProvider.php
rm app/Providers/EventServiceProvider.php
rm tests/CreatesApplication.php
rm app/Http/Middleware/Authenticate.php
rm app/Http/Middleware/EncryptCookies.php
rm app/Http/Middleware/PreventRequestsDuringMaintenance.php
rm app/Http/Middleware/RedirectIfAuthenticated.php
rm app/Http/Middleware/TrimStrings.php
rm app/Http/Middleware/TrustHosts.php
rm app/Http/Middleware/TrustProxies.php
rm app/Http/Middleware/ValidateSignature.php
rm app/Http/Middleware/VerifyCsrfToken.php
```

**Keep these custom middleware files:**
- `app/Http/Middleware/CheckApiTokenExpiration.php` (custom business logic)
- `app/Http/Middleware/ContentSecurityPolicy.php` (custom CSP headers)

**Step 2: Update tests/TestCase.php**

In Laravel 11, `TestCase` no longer uses the `CreatesApplication` trait.

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    //
}
```

**Step 3: Update config/app.php — remove deleted providers**

Remove `RouteServiceProvider` and `EventServiceProvider` from the providers array in `config/app.php`. The `AuthServiceProvider` stays. Look for lines referencing:
- `App\Providers\RouteServiceProvider::class` → remove
- `App\Providers\EventServiceProvider::class` → remove

**Step 4: Commit**

```bash
git add -A
git commit -m "Remove L9 kernel files, stubs, and providers replaced by L11 structure"
```

---

### Task 7: Update PHPUnit configuration for PHPUnit 11

**Files:**
- Modify: `phpunit.xml`

**Step 1: Rewrite phpunit.xml for PHPUnit 11**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         cacheDirectory=".phpunit.cache"
>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    <source>
        <include>
            <directory>app</directory>
        </include>
    </source>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="BCRYPT_ROUNDS" value="4"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="MAIL_MAILER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="TELESCOPE_ENABLED" value="false"/>
    </php>
</phpunit>
```

Key changes from PHPUnit 9:
- `<coverage>` → `<source>` (PHPUnit 10+ change)
- `processUncoveredFiles` removed
- `suffix` attributes removed from `<directory>` in testsuites
- Added `cacheDirectory=".phpunit.cache"`

**Step 2: Add `.phpunit.cache` to .gitignore if not present**

```bash
echo ".phpunit.cache" >> .gitignore
```

**Step 3: Commit**

```bash
git add phpunit.xml .gitignore
git commit -m "Update phpunit.xml for PHPUnit 11 compatibility"
```

---

### Task 8: Run composer update

**Files:**
- Modified by composer: `composer.lock`, `vendor/`

**Step 1: Delete vendor and lock file for clean install**

```bash
cd /Users/ibrahima/Documents/perso/profood/api-profood
rm -rf vendor composer.lock
```

**Step 2: Run composer install**

```bash
composer install
```

Expected: All dependencies resolve successfully. Watch for:
- Intervention/Image 3.x installs
- Laravel 11.x installs
- No version conflicts

If there are conflicts, resolve them by adjusting version constraints in composer.json.

**Step 3: Commit lock file**

```bash
git add composer.json composer.lock
git commit -m "Install Laravel 11 dependencies"
```

---

### Task 9: Migrate intervention/image v2 → v3 (4 controllers, 11 usages)

**Files:**
- Modify: `app/Http/Controllers/CategoryController.php` (lines 14, 40-54, 100+)
- Modify: `app/Http/Controllers/BoxTypeController.php` (lines 16, 42-56, 148+)
- Modify: `app/Http/Controllers/SliceController.php` (lines 15, 41-54, 147+)
- Modify: `app/Http/Controllers/UserController.php` (lines 27, 137-151, 250+, 384+, 520+, 1659+)
- Delete: `config/image.php` (v3 does not use a config file by default)

**Step 1: Create an ImageService helper**

Since all 11 usages follow the same pattern (make → fit → encode data-url → stream), create a reusable service to avoid repeating the v3 boilerplate.

Create `app/Services/ImageService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Process an uploaded image: resize/crop and return as base64 data URL.
     */
    public function processToBase64(UploadedFile $file, int $width = 256, int $height = 256): string
    {
        $image = $this->manager->read($file->getPathname());
        $image->cover($width, $height);

        return $image->toJpeg()->toDataUri();
    }
}
```

Key v2 → v3 changes:
- `Image::make($file)` → `$manager->read($file->getPathname())`
- `$img->fit(256, 256)` → `$image->cover(256, 256)` (fit was renamed to cover)
- `$img->encode("data-url")` → `$image->toJpeg()->toDataUri()`
- No more `$img->stream()` needed (was a no-op in the original code)
- Facade removed, explicit driver instantiation

**Step 2: Update CategoryController**

Replace the import and image processing blocks. The pattern at lines 14, 39-55 and ~99-110:

Replace:
```php
use Intervention\Image\Facades\Image;
```
With:
```php
use App\Services\ImageService;
```

Replace each image processing block (2 occurrences) from:
```php
$illustration = $request->file('illustration');
$img = Image::make($illustration);
$img->fit(256, 256, function ($constraint) {
    $constraint->upsize();
}, 'center');
$image_to_base64 = (string)$img->encode("data-url");
$img->stream($illustration->getClientOriginalExtension());
$c_illustration = $image_to_base64;
```

To:
```php
$illustration = $request->file('illustration');
$imageService = new ImageService();
$c_illustration = $imageService->processToBase64($illustration, 256, 256);
```

**Step 3: Update BoxTypeController**

Same pattern as CategoryController. Replace import line 16, and 2 image blocks (~lines 42-57 and ~148-163).

Replace:
```php
use Intervention\Image\Facades\Image;
```
With:
```php
use App\Services\ImageService;
```

Replace each block (2 occurrences) from:
```php
$illustration = $request->file('illustration');
$img = Image::make($illustration);
$img->fit(256, 256, function ($constraint) {
    $constraint->upsize();
}, 'center');
$image_to_base64 = (string)$img->encode("data-url");
$img->stream($illustration->getClientOriginalExtension());
$bt_illustration = $image_to_base64;
```

To:
```php
$illustration = $request->file('illustration');
$imageService = new ImageService();
$bt_illustration = $imageService->processToBase64($illustration, 256, 256);
```

**Step 4: Update SliceController**

Same pattern. Replace import line 15, and 2 image blocks (~lines 41-55 and ~147-161).

**Step 5: Update UserController**

Replace import line 27. This controller uses `Image::make($avatar)` with `fit(300, 300)` — note the different size.

Replace each block (5 occurrences at lines ~137, ~250, ~384, ~520, ~1659) from:
```php
$avatar = $request->file('avatar');
$img = Image::make($avatar);
$img->fit(300, 300, function ($constraint) {
    $constraint->upsize();
}, 'center');
$image_to_base64 = (string)$img->encode("data-url");
$img->stream($avatar->getClientOriginalExtension());
$user->avatar = $image_to_base64;
```

To:
```php
$avatar = $request->file('avatar');
$imageService = new ImageService();
$user->avatar = $imageService->processToBase64($avatar, 300, 300);
```

**Step 6: Delete config/image.php**

Intervention/Image v3 doesn't use this config file.

```bash
rm config/image.php
```

**Step 7: Commit**

```bash
git add app/Services/ImageService.php \
        app/Http/Controllers/CategoryController.php \
        app/Http/Controllers/BoxTypeController.php \
        app/Http/Controllers/SliceController.php \
        app/Http/Controllers/UserController.php
git rm config/image.php
git commit -m "Migrate intervention/image v2 to v3 with ImageService"
```

---

### Task 10: Handle remaining L11 compatibility fixes

**Files:**
- Modify: `config/app.php` (if needed after Task 6)
- Possibly modify: `config/auth.php`, `config/database.php`

**Step 1: Verify config files compatibility**

Laravel 11 simplified many config files. For an upgrade (not fresh install), existing config files continue to work. Check:

```bash
php artisan config:clear
php artisan config:cache
```

Expected: No errors. If there are deprecated config keys, fix them.

**Step 2: Check for any `$routeMiddleware` references in code**

```bash
grep -r "routeMiddleware" app/ --include="*.php"
```

Expected: No results (the Kernel is deleted, and this property no longer exists).

**Step 3: Verify artisan commands work**

```bash
php artisan --version
php artisan route:list --compact
```

Expected: Laravel 11.x.x, all routes listed correctly.

**Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "Fix remaining Laravel 11 compatibility issues"
```

---

### Task 11: Run smoke tests and verify

**Files:**
- None (testing only)

**Step 1: Clear all caches**

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

**Step 2: Run the smoke tests**

```bash
php artisan test tests/Feature/SmokeTest.php --verbose
```

Expected: All 6 smoke tests PASS.

**Step 3: Run the full test suite**

```bash
php artisan test --verbose
```

Expected: All tests pass.

**Step 4: Manual verification**

Start the dev server and hit key endpoints:

```bash
php artisan serve &
curl -s http://localhost:8000/api/get-box-types | head -c 200
curl -s http://localhost:8000/api/get-categories | head -c 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/get-orders
curl -sI http://localhost:8000/api/get-box-types | grep -i "x-content-type"
kill %1
```

Expected:
- Box types: JSON array
- Categories: JSON array
- Orders without auth: 401
- CSP header: `x-content-type-options: nosniff`

---

### Task 12: Update Procfile and deployment config

**Files:**
- Verify: `Procfile`
- Modify if needed: `Procfile`

**Step 1: Check Procfile compatibility**

Current Procfile:
```
web: vendor/bin/heroku-php-apache2 public/
worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

This is compatible with Laravel 11. No changes needed unless Heroku PHP buildpack requires a specific version.

**Step 2: Verify composer.json scripts are L11-compatible**

Check that `post-autoload-dump` and `post-update-cmd` scripts still work:

```bash
composer dump-autoload
```

Expected: No errors.

**Step 3: Final commit on migration branch**

```bash
git add -A
git commit -m "Verify deployment configuration for Laravel 11"
```

---

### Task 13: Final review and merge preparation

**Files:**
- None (review only)

**Step 1: Review all changes in the branch**

```bash
git log --oneline main..feature/laravel-11-migration
git diff main..feature/laravel-11-migration --stat
```

**Step 2: Run all tests one final time**

```bash
php artisan test --verbose
```

Expected: All tests PASS.

**Step 3: Merge into main**

```bash
git checkout main
git merge feature/laravel-11-migration
```

**Step 4: Tag the release**

```bash
git tag -a v2.0.0 -m "Migrate to Laravel 11"
```

---

## Summary of all changes

| Category | Files affected | Action |
|----------|---------------|--------|
| Dependencies | `composer.json`, `composer.lock` | Version bumps |
| Bootstrap | `bootstrap/app.php` | Complete rewrite to L11 slim |
| Deleted (Kernel) | `app/Http/Kernel.php`, `app/Console/Kernel.php` | Replaced by bootstrap/app.php |
| Deleted (Exception) | `app/Exceptions/Handler.php` | Moved to bootstrap/app.php |
| Deleted (Providers) | `RouteServiceProvider`, `EventServiceProvider` | Absorbed into AppServiceProvider + bootstrap |
| Deleted (Middleware stubs) | 9 middleware files | Replaced by L11 framework defaults |
| Deleted (Test trait) | `tests/CreatesApplication.php` | Not needed in L11 |
| Modified (Provider) | `AppServiceProvider.php` | Added rate limiting |
| Modified (Config) | `config/app.php`, `phpunit.xml` | Removed old providers, PHPUnit 11 format |
| Created (Service) | `app/Services/ImageService.php` | intervention/image v3 wrapper |
| Modified (Controllers) | 4 controllers (11 image usages) | v2→v3 API changes |
| Deleted (Config) | `config/image.php` | Not used by intervention/image v3 |
| Created (Tests) | `tests/Feature/SmokeTest.php` | Non-regression smoke tests |
| Modified (Tests) | `tests/TestCase.php` | Remove CreatesApplication trait |
