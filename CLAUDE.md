# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Profood is a full-stack e-commerce platform for a Senegalese butchery business. The system consists of three repositories:

1. **profood-app** - Ionic/Capacitor mobile app for customers (iOS/Android/PWA)
2. **api-profood** - Laravel 9 REST API backend with PostgreSQL
3. **profood-manager-app** - React web application for admin/manager operations

All three applications share a single Laravel API backend hosted at `https://api.profood-app.com`.

## Repository Structure

```
profood/
├── profood-app/              # Mobile customer app
├── api-profood/              # Laravel API backend
└── profood-manager-app/      # Web admin panel
```

## Development Commands

### API Backend (api-profood/)

```bash
# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database operations
php artisan migrate           # Run migrations
php artisan migrate:fresh     # Fresh migration (destroys data)
php artisan db:seed          # Seed database

# Development server
php artisan serve            # Starts on http://localhost:8000

# Testing & code quality
php artisan test             # Run PHPUnit tests
./vendor/bin/pint            # Run Laravel Pint (code formatter)

# Cache management
php artisan config:cache     # Cache configuration
php artisan config:clear     # Clear config cache
php artisan route:cache      # Cache routes
php artisan cache:clear      # Clear application cache

# Production deployment (Heroku)
# Uses Procfile: web: vendor/bin/heroku-php-apache2 public/
```

### Mobile App (profood-app/)

```bash
# Install dependencies
npm install

# Development
npm start                    # Web development server (localhost:3000)

# Build
npm run build               # Production build (CI=false to avoid treating warnings as errors)

# Testing
npm test                    # Run Jest tests with Ionic transforms

# Capacitor (native mobile)
npx cap sync                # Sync web assets to native projects
npx cap open android        # Open in Android Studio
npx cap open ios            # Open in Xcode
npx cap copy                # Copy web build to native projects

# Build for production
npm run build && npx cap sync
```

### Manager App (profood-manager-app/)

```bash
# Install dependencies
npm install

# Development
npm start                   # Development server (localhost:3000)

# Build
npm run build              # Production build to build/ folder

# Testing
npm test                   # Run Jest tests
```

## Architecture Overview

### Authentication Flow

**Firebase Authentication** is used on both frontend applications:
- Mobile app uses Firebase project `profood-app`
- Manager app uses Firebase project `profood-manager`
- Firebase ID tokens are sent to Laravel API for validation
- Laravel API issues its own API tokens using Laravel Sanctum

### User Roles (Role Model Constants)

```php
// app/Models/Role.php
const CUSTOMER = 8;      // Mobile app users only
const MANAGER = 16;      // Can manage orders, products
const ADMIN = 32;        // Can manage users, all CRUD operations
const SUPER_ADMIN = 64;  // Full system access
```

Role checking is polymorphic - users have associated Customer, Manager, Admin, or SuperAdmin models.

### State Management

**Mobile App (profood-app):**
- Uses 22+ React Context providers for global state
- Main contexts: `DataContext`, `UserInfosContext`, `CartContext` (via DataProvider), `ThemeModeContext`
- Located in `src/contexts/`

**Manager App (profood-manager-app):**
- Uses 10 Context providers with centralized `DataContext`
- Key contexts: `DataContext`, `LoadingSpinnerContext`, `ThemeModeContext`, `SidebarContext`
- Located in `src/components/contexts/`

### API Integration

Both frontend apps use axios configured in `src/api/`:
- **Production:** `https://api.profood-app.com/api/`
- **Development:** `http://localhost:8000/api/`

Environment detection is automatic based on build mode.

### Database Schema (PostgreSQL)

**Core Models:**
- **Users:** Base user table with polymorphic roles (Customer, Manager, Admin, SuperAdmin)
- **Products:** BoxType (product packages), Category, Slice (individual items)
- **Shopping:** Cart, CartSlice, Box, BoxSlice (cart items are boxes containing slices)
- **Orders:** Order, OrderStatus, OrderPaymentStatus, OrderHistory
- **Locations:** Departement, Arrondissement, Commune, Localite (Senegalese administrative divisions)

**Key Relationships:**
- A Box contains multiple BoxSlices
- A Cart contains multiple Boxes
- An Order is created from a Cart and contains order history for status tracking
- Products (BoxTypes, Categories, Slices) have images stored as URLs

### API Routes Structure (api-profood/routes/api.php)

**Public routes:**
- `GET /get-box-types`, `/get-categories`, `/get-slices` - Product listings
- `POST /signup`, `/signin`, `/password-reset` - Authentication
- `POST /redirect-payment` - PayTech payment callback

**Protected routes** (require `auth:api` middleware):
- User info: `GET /user`, `/customer`, `/manager`, `/admin`, `/super_admin`
- Cart: `POST /add-box-to-cart`, `/add-slices-to-cart`, `DELETE /remove-box-from-cart`
- Orders: `GET /get-orders`, `POST /add-order-with-payment`, `/approve-order/{id}`
- Admin CRUD: Full management of boxes, categories, slices, customers, users
- Statistics: `GET /get-orders-statistics-details` (dashboard metrics)

### Third-Party Integrations

**PayTech Payment Gateway** (`app/Core/PayTech.php`):
- Senegalese mobile money payment processor
- Used for order payments in mobile app
- Webhook endpoint: `POST /redirect-payment`

**Twilio SMS** (via twilio/sdk):
- Phone number verification during signup
- OTP code delivery

**Postmark Email** (via symfony/postmark-mailer):
- Order confirmations: `OrderAcknowledgmentEmail`
- Order notifications to admin: `OrderNotificationEmail`
- Status updates to customers: `CustomerOrderStatusNotificationEmail`
- Located in `app/Mail/`

**Intervention/Image** (intervention/image):
- Image upload and processing for product photos
- Handles BoxType, Category, and Slice images

### Internationalization

Both frontend apps support French (default) and English:
- Uses i18next with language detection
- Translation files in `src/locales/en/` and `src/locales/fr/`
- Language persisted in localStorage

## Important File Locations

### API (Laravel)

```
app/
├── Core/PayTech.php              # Payment gateway integration
├── Http/Controllers/             # 13 controllers (UserController is largest)
├── Mail/                         # Email templates (Mailable classes)
├── Models/                       # 22 Eloquent models
│   └── Role.php                  # User role constants
routes/api.php                    # All API endpoints (293 lines)
database/migrations/              # Schema definitions
config/
├── auth.php                      # API token authentication
├── database.php                  # PostgreSQL configuration
└── services.php                  # Twilio, Postmark credentials
```

### Mobile App (Ionic React)

```
src/
├── contexts/                     # 22 state management contexts
├── pages/                        # Page components organized by feature
│   ├── auth/                     # Sign in, sign up, password reset
│   ├── cart/                     # Shopping cart
│   ├── orders/                   # Order creation & history
│   └── account/                  # User settings
├── api/                          # Axios configuration
├── firebase.ts                   # Firebase config for profood-app project
└── i18n.tsx                      # i18next setup
capacitor.config.ts               # App ID: com.profoodapp.app
```

### Manager App (React)

```
src/
├── components/contexts/          # 10 state contexts with DataContext
├── pages/
│   ├── dashboard/                # Statistics with ApexCharts
│   ├── boxes/                    # Box type CRUD
│   ├── categories/               # Category CRUD
│   ├── products/                 # Slice/product CRUD
│   ├── customers/                # Customer management (4 pages)
│   ├── orders/                   # Order management (15 files)
│   └── settings/users/           # Admin/Manager user CRUD
├── types.ts                      # TypeScript definitions (275 lines)
├── firebase.ts                   # Firebase config for profood-manager project
└── helpers/AssetHelpers.ts       # Utility functions
```

## Common Development Workflows

### Adding a New Product (Box Type)

1. **Manager App:** Navigate to Boxes page, click "Add New Box Type"
2. Fill form with name, description, price, upload image
3. **API:** `POST /add-box-type` with multipart/form-data
4. **Controller:** `BoxTypeController@store` validates, stores image via Intervention/Image, saves to DB
5. **Mobile App:** New box type immediately appears in product listings (no cache)

### Order Workflow

1. **Customer (Mobile App):**
   - Browse products → Add boxes to cart → Checkout
   - `POST /add-order-with-payment` creates order and initiates PayTech payment
   - PayTech redirects to mobile app after payment

2. **PayTech Webhook:**
   - `POST /redirect-payment` validates payment and updates `OrderPaymentStatus`
   - Sends `OrderNotificationEmail` to admin
   - Sends `OrderAcknowledgmentEmail` to customer

3. **Admin (Manager App):**
   - View order in Orders page
   - Update status (pending → confirmed → delivered)
   - Each status change triggers `CustomerOrderStatusNotificationEmail`

### Making API Changes

When modifying API endpoints that affect both frontend apps:

1. Update Laravel controller in `api-profood/app/Http/Controllers/`
2. Test with `php artisan test` (if tests exist)
3. Update TypeScript types in both apps:
   - `profood-app/src/` (inline types)
   - `profood-manager-app/src/types.ts` (centralized)
4. Update axios calls in respective `src/api/` or component files
5. Test both apps against local API (`http://localhost:8000`)

### Deploying Changes

**API (Heroku):**
```bash
cd api-profood
git push heroku main  # Assumes Heroku remote configured
# Migrations run automatically via release phase or manually:
heroku run php artisan migrate
```

**Mobile App (Production Build):**
```bash
cd profood-app
npm run build
npx cap sync
npx cap open android  # Build signed APK in Android Studio
npx cap open ios      # Archive in Xcode
```

**Manager App (Static Hosting):**
```bash
cd profood-manager-app
npm run build
# Upload build/ folder to web host
```

## Testing

### API (Laravel)
- PHPUnit configured in `phpunit.xml`
- Run: `php artisan test`
- Tests should be created in `tests/Feature/` and `tests/Unit/`

### Frontend Apps
- Jest with React Testing Library
- Run: `npm test`
- Mobile app has custom Jest config for Ionic transforms (see package.json)

## Environment Variables

### API (.env)

Critical variables for local development:
```env
# Database
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=profood
DB_USERNAME=postgres
DB_PASSWORD=

# Twilio (SMS verification)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Postmark (Email)
POSTMARK_TOKEN=

# PayTech (Payment)
PAYTECH_API_KEY=
PAYTECH_API_SECRET=

# Firebase (optional - only if using admin SDK)
FIREBASE_CREDENTIALS=path/to/serviceAccount.json
```

### Frontend Apps

Firebase credentials are in `src/firebase.ts` - these are client-safe public keys. API URLs are environment-detected (no .env needed for development).

## Git Workflow

SSH key for GitHub account `support@allaholding.net` (username: mediapexdev):
- Key: `~/.ssh/id_ed25519_allaholding`
- Alias: `git@github-allaholding`

To clone repositories:
```bash
git clone git@github-allaholding:mediapexdev/profood-app.git
git clone git@github-allaholding:mediapexdev/api-profood.git
git clone git@github-allaholding:mediapexdev/profood-manager-app.git
```

For existing repos, set remote:
```bash
git remote set-url origin git@github-allaholding:mediapexdev/repo-name.git
```

## Data Flow Example

**Customer places order:**
1. Mobile app: Add items to cart (stores in `CartContext`, syncs to API)
2. API: `POST /add-box-to-cart` creates/updates Cart and CartSlice records
3. Mobile app: Checkout → `POST /add-order-with-payment`
4. API: Creates Order, initiates PayTech payment, returns payment URL
5. Mobile app: Redirects to PayTech
6. Customer completes payment on PayTech
7. PayTech: Webhook `POST /redirect-payment` to API
8. API: Updates OrderPaymentStatus, sends emails (customer + admin)
9. Admin (Manager app): Receives email, views order, updates status
10. Customer: Receives status update emails as order progresses

## Key Constraints & Patterns

### API
- Stateless authentication (token-based, no sessions)
- All API responses should be JSON
- Images stored as URLs (intervention/image handles uploads)
- Role-based authorization in controllers (check user role before operations)
- Email queue is synchronous (no Redis/queue worker configured)

### Mobile App
- Ionic CSS utilities should be preferred over custom CSS
- All API calls go through axios instance in `src/api/`
- Context updates trigger re-renders across components
- Capacitor plugins for native features (splash screen, status bar, keyboard)
- PWA with service worker caching via Workbox

### Manager App
- Bootstrap 5 for layouts (responsive grid system)
- Protected routes use `RequireAuth` wrapper checking Firebase auth + user role
- ApexCharts for dashboard visualizations
- Forms use controlled components with React Select for dropdowns
- Dark/light theme toggle persists in localStorage

## UX Roadmap & Improvements

**Full documentation:** See `PARCOURS-UTILISATEURS-PROFOOD.md` for detailed UX analysis.

### Current UX Issues to Address

**Mobile App (profood-app):**
- ❌ Login required to add items to cart (major friction)
- ❌ No guest cart / guest checkout
- ❌ Complex 7-step registration process
- ❌ No product search or filters
- ❌ No order tracking timeline
- ❌ Location selection too complex (4 levels)

**Manager App (profood-manager-app):**
- ❌ Dashboard loads everything at once (slow)
- ❌ No Kanban view for orders
- ❌ No bulk actions on orders
- ❌ No stock management
- ❌ No promotions system
- ❌ Base64 image upload (slow)

### Priority Implementations

**Phase 1 - Guest Cart & Checkout (HIGH PRIORITY):**
```
1. Allow adding to cart WITHOUT login (store in localStorage)
2. At checkout, offer 2 options:
   - "I have an account" → Login
   - "Order without account" → Minimal form (name, phone, address)
3. After guest order: optional account creation with pre-filled data

API changes needed:
- orders.user_id → nullable
- Add: is_guest, guest_name, guest_phone, guest_email, guest_address columns
- New route: POST /api/guest-order (no auth required)
- New route: POST /api/convert-guest-order (create account from guest order)
```

**Phase 2 - Search & Filters:**
- Product search with autocomplete
- Filter by category, price range, availability
- Sort by popularity, price, newest

**Phase 3 - Order Tracking:**
- Visual timeline (pending → preparing → shipping → delivered)
- Push notifications for status changes
- Estimated delivery time

**Phase 4 - Manager Improvements:**
- Kanban board for orders (drag & drop status change)
- Bulk actions (select multiple → change status)
- Stock management with low-stock alerts
- Promotions/discount codes system

### Design Guidelines

**Colors:**
- Primary: #E74C3C (meat red)
- Secondary: #27AE60 (fresh green)
- Success: #2ECC71
- Warning: #F39C12
- Dark: #2C3E50
- Light: #ECF0F1

**UX Principles:**
- Minimize friction (fewer steps = more conversions)
- Guest checkout increases conversion by 40-60%
- Show progress indicators for multi-step processes
- Use skeleton screens instead of spinners
- Optimistic UI updates (show result immediately, rollback on error)

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
