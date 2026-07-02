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
        // The API runs behind the LWS / Varnish reverse proxy. Trust the
        // forwarded headers so the app detects HTTPS (X-Forwarded-Proto) and
        // generates correct absolute URLs — password-reset links, PayTech
        // redirect URLs, etc. Laravel 11 trusts no proxies by default.
        $middleware->trustProxies(at: '*');

        $middleware->append(\App\Http\Middleware\ContentSecurityPolicy::class);

        $middleware->alias([
            'check.token.expiration' => \App\Http\Middleware\CheckApiTokenExpiration::class,
            'csp' => \App\Http\Middleware\ContentSecurityPolicy::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Ressource introuvable',
                ], 404);
            }
        });
    })
    ->create();
