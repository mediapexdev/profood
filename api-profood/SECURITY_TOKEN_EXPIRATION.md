# API Token Expiration Security Implementation

## Overview

This document describes the token expiration security feature implemented to prevent API tokens from lasting forever. Previously, tokens had no expiration, which posed a security risk if tokens were compromised.

## What Changed

### 1. Database Changes

A new column `api_token_expires_at` was added to the `users` table to store when each token expires.

**Migration:** `2026_01_28_210827_add_api_token_expiration_to_users_table.php`

### 2. Token Creation

When users sign in (`UserController::signin`), the API now:
- Creates or reuses tokens as before
- Sets an expiration timestamp based on the `API_TOKEN_EXPIRATION_MINUTES` environment variable
- Extends expiration for existing sessions to keep active users logged in

### 3. Token Validation

A new middleware `CheckApiTokenExpiration` was added to:
- Check if the authenticated user's token has expired on each request
- Automatically log out users with expired tokens
- Return a clear error message when tokens expire

### 4. Token Cleanup

When users sign out (`UserController::signout`), the system now:
- Clears the `api_token_expires_at` timestamp along with the token
- Properly cleans up session state

## Configuration

### Environment Variable

Add to your `.env` file:

```env
# API Token Expiration
# Duration in minutes before API tokens expire
# Default: 43200 minutes (30 days)
# Set to 0 to disable expiration (not recommended for security)
API_TOKEN_EXPIRATION_MINUTES=43200
```

### Common Values

| Duration | Minutes | Use Case |
|----------|---------|----------|
| 1 day | 1440 | High security applications |
| 7 days | 10080 | Standard security |
| 30 days | 43200 | **Recommended - Default** |
| 60 days | 86400 | Extended access for mobile apps |
| 90 days | 129600 | Long-term access |
| Never expire | 0 | **Not recommended** - backward compatibility only |

## How It Works

### Token Lifecycle

1. **Sign In:**
   - User authenticates with phone number and password
   - System creates or reuses existing token
   - Sets `api_token_expires_at` to `now + API_TOKEN_EXPIRATION_MINUTES`
   - Returns token to client

2. **API Requests:**
   - Client includes token in Authorization header: `Authorization: Bearer {token}`
   - `auth:api` middleware validates token exists and matches user
   - `check.token.expiration` middleware validates token hasn't expired
   - If expired: Returns 401 with message "Votre session a expiré. Veuillez vous reconnecter."
   - If valid: Request proceeds normally

3. **Sign Out:**
   - User calls signout endpoint
   - System decrements session count
   - If last session: Clears token and expiration timestamp
   - User is logged out

### Sliding Expiration

The implementation uses a "sliding expiration" model:
- Each time a user signs in to an existing session, the expiration is extended
- This keeps active users logged in without requiring re-authentication
- Inactive users (who don't sign in again) will eventually be logged out

## Security Benefits

1. **Limited Token Lifetime:** Even if a token is compromised, it only works until expiration
2. **Automatic Cleanup:** Expired tokens are automatically invalidated
3. **Clear User Communication:** Users receive a clear message when their session expires
4. **Backward Compatible:** Setting expiration to 0 disables the feature for gradual migration
5. **Configurable:** Different expiration times can be set for different environments

## Implementation Details

### Files Modified

1. **Database:**
   - `database/migrations/2026_01_28_210827_add_api_token_expiration_to_users_table.php` (new)
   - Added `api_token_expires_at` column to `users` table

2. **Models:**
   - `app/Models/User.php`
   - Added `api_token_expires_at` to fillable array
   - Added `api_token_expires_at` to hidden array (not exposed in API responses)
   - Added datetime cast for the timestamp

3. **Controllers:**
   - `app/Http/Controllers/UserController.php`
   - Updated `signin()` method to set token expiration
   - Updated `signout()` method to clear expiration timestamp

4. **Middleware:**
   - `app/Http/Middleware/CheckApiTokenExpiration.php` (new)
   - Validates token expiration on each authenticated request

5. **Routing:**
   - `routes/api.php`
   - Added `check.token.expiration` middleware to protected routes
   - `app/Http/Kernel.php`
   - Registered the new middleware

6. **Configuration:**
   - `.env`
   - Added `API_TOKEN_EXPIRATION_MINUTES=43200`

7. **Documentation:**
   - `config/sanctum.php`
   - Added note that this app doesn't use Sanctum tokens

## Testing

### Test Token Expiration

1. **Set Short Expiration (for testing):**
   ```env
   API_TOKEN_EXPIRATION_MINUTES=1
   ```

2. **Sign In:**
   ```bash
   curl -X POST https://api.profood-app.com/api/signin \
     -H "Content-Type: application/json" \
     -d '{
       "phone_number": "771234567",
       "password": "your_password",
       "app_key": "your_app_key"
     }'
   ```

3. **Wait 2 Minutes**

4. **Make Authenticated Request:**
   ```bash
   curl -X GET https://api.profood-app.com/api/user \
     -H "Authorization: Bearer {your_token}"
   ```

5. **Expected Response:**
   ```json
   {
     "message": "Votre session a expiré. Veuillez vous reconnecter.",
     "error": "token_expired"
   }
   ```

### Test Normal Operation

1. **Set Normal Expiration:**
   ```env
   API_TOKEN_EXPIRATION_MINUTES=43200
   ```

2. **Sign In and Make Requests:**
   - Tokens should work normally for 30 days
   - Re-signing in extends the expiration

## Migration Guide

### For Existing Deployments

1. **Run the Migration:**
   ```bash
   php artisan migrate
   ```
   This adds the `api_token_expires_at` column to existing users table.

2. **Add Environment Variable:**
   Update production `.env` file:
   ```env
   API_TOKEN_EXPIRATION_MINUTES=43200
   ```

3. **Deploy Code Changes:**
   Deploy the updated controllers, middleware, and routes.

4. **Existing Tokens:**
   - Existing tokens will continue to work
   - They will have `api_token_expires_at = NULL` (no expiration)
   - When users sign in again, expiration will be set
   - Gradually, all tokens will have expiration set

### For New Deployments

The feature is enabled by default with 30-day expiration. No additional configuration needed.

## Troubleshooting

### Users Getting Logged Out Unexpectedly

**Cause:** Token expiration is too short for your use case.

**Solution:** Increase `API_TOKEN_EXPIRATION_MINUTES` in `.env`:
```env
API_TOKEN_EXPIRATION_MINUTES=86400  # 60 days
```

### Legacy Tokens Not Expiring

**Cause:** Tokens created before this feature was added have `api_token_expires_at = NULL`.

**Solution:**
- These tokens won't expire until users sign in again
- If you want to force expiration, you can update all NULL values:
  ```sql
  UPDATE users
  SET api_token_expires_at = NOW() + INTERVAL '30 days'
  WHERE api_token IS NOT NULL AND api_token_expires_at IS NULL;
  ```

### Want to Disable Expiration Temporarily

**Solution:** Set expiration to 0:
```env
API_TOKEN_EXPIRATION_MINUTES=0
```

## Frontend Integration

### Mobile App (profood-app)

Update your API error handling to detect token expiration:

```typescript
// src/api/axiosInstance.ts or similar
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.error === 'token_expired') {
      // Clear stored token
      localStorage.removeItem('api_token');

      // Redirect to login
      window.location.href = '/signin';

      // Show message to user
      alert(error.response.data.message); // "Votre session a expiré. Veuillez vous reconnecter."
    }
    return Promise.reject(error);
  }
);
```

### Manager App (profood-manager-app)

Similar handling for admin/manager sessions:

```typescript
// Handle 401 responses with token_expired error
if (error.response?.data?.error === 'token_expired') {
  // Clear auth state
  logout();

  // Redirect to login
  navigate('/login');

  // Show notification
  toast.error(error.response.data.message);
}
```

## Best Practices

1. **Use Appropriate Expiration Times:**
   - Mobile apps: 30-60 days (users don't want to re-login frequently)
   - Web apps: 7-14 days (shorter for better security)
   - Admin panels: 1-7 days (higher security requirements)

2. **Monitor Token Usage:**
   - Track how often tokens expire
   - Adjust expiration times based on user behavior

3. **Clear Communication:**
   - Show clear messages when sessions expire
   - Make re-authentication easy

4. **Security vs. Convenience:**
   - Shorter expiration = better security but more user friction
   - Longer expiration = better UX but higher security risk
   - Find the balance for your use case

## References

- Laravel Authentication: https://laravel.com/docs/9.x/authentication
- API Token Authentication: https://laravel.com/docs/9.x/sanctum#api-token-authentication
- Carbon Date/Time: https://carbon.nesbot.com/docs/
