<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

/**
 * Middleware to check if the user's API token has expired.
 *
 * This middleware ensures that tokens don't last forever by validating
 * the api_token_expires_at timestamp on each authenticated request.
 * If the token has expired, the user is logged out and must re-authenticate.
 */
class CheckApiTokenExpiration
{
    /**
     * Handle an incoming request.
     *
     * Validates that the authenticated user's API token has not expired.
     * If the token is expired:
     * - Logs the user out
     * - Clears the api_token and expiration timestamp
     * - Returns 401 Unauthorized response
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Only check token expiration for authenticated users
        if (Auth::check()) {
            $user = Auth::user();

            // Check if token expiration is enabled and if the token has expired
            // api_token_expires_at can be null for legacy tokens or if expiration is disabled
            if ($user->api_token_expires_at && Carbon::now()->greaterThan($user->api_token_expires_at)) {
                // Token has expired - clear it from the database
                $user->api_token = null;
                $user->api_token_expires_at = null;
                $user->logged = false;
                $user->session_count = max(0, $user->session_count - 1);
                $user->save();

                // Log the user out
                Auth::logout();

                // Return unauthorized response with clear message
                return response()->json([
                    'message' => 'Votre session a expiré. Veuillez vous reconnecter.',
                    'error' => 'token_expired'
                ], 401);
            }
        }

        return $next($request);
    }
}
