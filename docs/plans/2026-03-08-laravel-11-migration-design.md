# Design : Migration api-profood de Laravel 9 vers Laravel 11

**Date :** 2026-03-08
**Statut :** Validé
**Approche :** Migration directe L9 → L11 sur branche dédiée

## Contexte

api-profood tourne sur Laravel 9.19 (EOL sécurité dépassé). L'API est en production avec peu de trafic. PHP 8.4.7 est déjà installé. Le codebase est propre (pas de deprecated patterns majeurs), avec 13 controllers, 24 modèles, 33 migrations, 21 Form Requests.

L'objectif est de migrer vers Laravel 11 en adoptant la nouvelle structure simplifiée (slim bootstrap, suppression du Kernel.php).

## Décisions

- **Version cible :** Laravel 11
- **Approche :** Migration directe L9 → L11 (pas de passage par L10)
- **Structure :** Adopter la nouvelle structure L11 (slim bootstrap/app.php, pas de Kernel.php)
- **intervention/image :** Migrer vers v3
- **Tests :** Smoke tests minimaux de non-régression
- **Déploiement :** Branche dédiée, merge après validation, rollback = redéployer main

## Dépendances à mettre à jour

| Package | Actuel | Cible | Breaking changes |
|---------|--------|-------|------------------|
| laravel/framework | ^9.19 | ^11.0 | Structure app, Kernel supprimé, config consolidée |
| laravel/sanctum | ^3.0 | ^4.0 | API stable, changements mineurs |
| laravel/tinker | ^2.7 | ^2.9 | Aucun |
| intervention/image | ^2.7 | ^3.0 | Image::make() → ImageManager::read(), driver explicite |
| phpunit/phpunit | ^9.5 | ^10.5 ou ^11.0 | Config XML, annotations → attributs |
| nunomaduro/collision | ^6.1 | ^8.0 | Aucun impact code |
| spatie/laravel-ignition | ^1.0 | ^2.0 | Aucun impact code |
| symfony/postmark-mailer | ^6.4 | ^7.0 | Version Symfony alignée avec L11 |
| symfony/http-client | ^6.4 | ^7.0 | Version Symfony alignée avec L11 |

Inchangés : guzzlehttp/guzzle ^7.2, twilio/sdk ^8.1, laravel/pint ^1.0, laravel/sail ^1.26

## Changements structurels

### Fichiers supprimés (remplacés par bootstrap/app.php)

- `app/Http/Kernel.php`
- `app/Console/Kernel.php`
- `app/Exceptions/Handler.php`
- `tests/CreatesApplication.php`

### Nouveau bootstrap/app.php

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(append: [
            \App\Http\Middleware\CheckApiTokenExpiration::class,
            \App\Http\Middleware\ContentSecurityPolicy::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Exception handling migré depuis Handler.php
    })
    ->create();
```

### Migration des Service Providers

- `RouteServiceProvider` : supprimé, routing dans bootstrap/app.php, rate limiting dans AppServiceProvider::boot()
- `AppServiceProvider` : conservé, reçoit le rate limiting (300 req/min)
- `AuthServiceProvider` : conservé tel quel
- `EventServiceProvider` : supprimé (L11 utilise auto-discovery par défaut)

### Middleware custom (inchangés en logique)

Les 3 middleware custom gardent leur code interne intact :
1. `CheckApiTokenExpiration` — vérifie expiration token API (30 jours)
2. `ContentSecurityPolicy` — headers CSP
3. Rate limiting — migré vers AppServiceProvider::boot() via RateLimiter facade

## Migration intervention/image v2 → v3

### Avant (v2)
```php
use Intervention\Image\Facades\Image;
$image = Image::make($request->file('image'))->resize(300, 300);
```

### Après (v3)
```php
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
$manager = new ImageManager(new Driver());
$image = $manager->read($request->file('image'))->resize(300, 300);
```

Driver GD conservé (ext-gd déjà requis). Si le code d'image est dans plusieurs controllers, créer un service wrapper pour centraliser l'instanciation.

## Tests de non-régression (smoke tests)

Écrits avant la migration comme baseline, relancés après :

1. `POST /api/signin` → 200 + token
2. `GET /api/get-box-types` → 200 + JSON array
3. `POST /api/add-box-to-cart` (auth) → 200
4. `GET /api/get-orders` (auth) → 200
5. Vérification headers CSP présents
6. Vérification token expiré → 401

## Plan de déploiement

1. Créer branche `feature/laravel-11-migration`
2. Appliquer tous les changements
3. Lancer les smoke tests localement
4. Tester sur Heroku staging si possible
5. Merger dans main + déployer
6. Rollback : redéployer le commit précédent sur main
