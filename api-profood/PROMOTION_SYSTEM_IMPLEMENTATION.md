# Système de Promotions - Documentation d'Implémentation

## Vue d'Ensemble

Le système de promotions permet aux administrateurs de créer et gérer des codes promotionnels qui peuvent être utilisés par les clients pour obtenir des réductions sur leurs commandes. Le système supporte trois types de réductions :

1. **Pourcentage** - Une réduction en pourcentage du montant de la commande
2. **Montant fixe** - Une réduction d'un montant fixe en CFA
3. **Livraison gratuite** - Les frais de livraison sont offerts

## Structure de la Base de Données

### Table `promotions`

Stocke toutes les informations sur les codes promotionnels.

**Colonnes principales :**

- `id` - Identifiant unique
- `code` - Code promotionnel unique (ex: SUMMER2026, WELCOME10)
- `name` - Nom d'affichage de la promotion
- `description` - Description détaillée
- `discount_type` - Type de réduction (percentage, fixed_amount, free_delivery)
- `discount_value` - Valeur de la réduction
- `minimum_order_amount` - Montant minimum de commande requis (CFA)
- `maximum_discount` - Réduction maximale applicable (pour les pourcentages)
- `usage_limit_total` - Nombre total d'utilisations autorisées (null = illimité)
- `usage_limit_per_user` - Nombre d'utilisations par utilisateur
- `usage_count` - Compteur d'utilisations actuel
- `starts_at` - Date de début de validité
- `expires_at` - Date d'expiration
- `is_active` - Statut actif/inactif
- `first_order_only` - Réservé aux premières commandes uniquement
- `applicable_to` - JSON pour ciblage avancé (fonctionnalité future)

**Indexes :**
- Sur `code` pour recherche rapide
- Sur `is_active` pour filtrage
- Sur `starts_at` et `expires_at` pour validation temporelle

### Table `promotion_usages`

Enregistre chaque utilisation d'un code promotionnel (audit trail complet).

**Colonnes :**

- `id` - Identifiant unique
- `promotion_id` - Référence à la promotion utilisée
- `user_id` - Utilisateur qui a utilisé la promotion (null pour invités)
- `order_id` - Commande sur laquelle la promotion a été appliquée
- `discount_applied` - Montant de réduction réellement appliqué (CFA)
- `created_at` / `updated_at` - Timestamps

**Relations :**
- Cascade delete sur `promotion_id` et `order_id`
- Set null sur `user_id` (préserve l'historique si l'utilisateur est supprimé)

### Modifications Table `orders`

Trois nouvelles colonnes ajoutées :

- `promotion_id` - Référence à la promotion utilisée (nullable, set null on delete)
- `discount_amount` - Montant de réduction appliqué (default: 0)
- `promotion_code` - Code promo utilisé (stocké pour référence historique)

## Modèles Eloquent

### Promotion (`App\Models\Promotion`)

**Constantes :**
```php
const TYPE_PERCENTAGE = 'percentage';
const TYPE_FIXED_AMOUNT = 'fixed_amount';
const TYPE_FREE_DELIVERY = 'free_delivery';
```

**Méthodes principales :**

1. **`isValid(): bool`**
   - Vérifie si la promotion est active
   - Valide les dates de début et d'expiration
   - Vérifie la limite d'utilisation totale
   - Ne vérifie PAS les restrictions par utilisateur

2. **`canBeUsedBy(?User $user): bool`**
   - Vérifie si un utilisateur spécifique peut utiliser la promotion
   - Gère les invités (null user)
   - Vérifie la limite d'utilisation par utilisateur
   - Vérifie la restriction "première commande uniquement"

3. **`calculateDiscount(float $orderAmount, float $deliveryFee = 0): float`**
   - Calcule le montant de réduction selon le type
   - Applique le montant minimum de commande
   - Respecte la réduction maximale (pour pourcentages)
   - Retourne le montant en CFA

4. **`getDiscountDescription(): string`**
   - Retourne une description lisible de la promotion
   - Format français avec CFA pour les montants

5. **`incrementUsageCount(): void`**
   - Incrémente le compteur d'utilisations
   - Utilise increment() de Eloquent pour éviter les race conditions

**Scopes :**
- `active()` - Promotions actives uniquement
- `validAt($date)` - Valides à une date donnée
- `withinUsageLimit()` - N'ayant pas atteint leur limite

**Relations :**
- `usages()` - hasMany PromotionUsage
- `orders()` - hasMany Order

### PromotionUsage (`App\Models\PromotionUsage`)

Modèle simple pour tracer les utilisations.

**Relations :**
- `promotion()` - belongsTo Promotion
- `user()` - belongsTo User
- `order()` - belongsTo Order

### Order (Modifications)

**Colonnes ajoutées au fillable :**
- `promotion_id`
- `discount_amount`
- `promotion_code`

**Nouvelle relation :**
- `promotion()` - belongsTo Promotion

## Contrôleurs

### PromotionController (`App\Http\Controllers\PromotionController`)

**Endpoints Admin (auth:api + role check) :**

1. **GET /api/promotions** - `index()`
   - Liste paginée de toutes les promotions
   - Paramètres : `per_page`, `page`
   - Ordre : plus récentes en premier

2. **POST /api/promotions** - `store()`
   - Création d'une nouvelle promotion
   - Validation via StorePromotionRequest
   - Log de la création

3. **GET /api/promotions/{id}** - `show()`
   - Détails d'une promotion spécifique
   - Inclut les statistiques d'utilisation

4. **PUT /api/promotions/{id}** - `update()`
   - Mise à jour d'une promotion
   - Validation via UpdatePromotionRequest
   - Mise à jour partielle supportée

5. **DELETE /api/promotions/{id}** - `destroy()`
   - Suppression d'une promotion
   - Les commandes conservent promotion_code et discount_amount

6. **GET /api/promotions/{id}/usages** - `usages()`
   - Historique d'utilisation d'une promotion
   - Liste paginée avec info utilisateur et commande

**Endpoint Public :**

7. **POST /api/validate-promo-code** - `validatePromoCode()`
   - Validation d'un code promo avant commande
   - Paramètres : `code`, `order_amount`, `delivery_fee` (optionnel)
   - Retourne : valid, promotion details, discount_amount, message
   - Gère les utilisateurs authentifiés ET invités

### OrderController (Modifications)

**Méthode `addOrder()` :**

Ajout de la gestion des codes promotionnels :

1. Récupération du code depuis `$request->promotion_code`
2. Validation du code et des conditions
3. Calcul de la réduction
4. Vérification du montant minimum
5. Enregistrement dans la commande
6. Création de l'enregistrement PromotionUsage
7. Incrémentation du compteur usage_count

**Méthode `addGuestOrder()` :**

Même logique que addOrder() mais :
- Passe `null` comme user à `canBeUsedBy()`
- Les invités ne peuvent pas utiliser les promos "première commande uniquement"
- user_id est null dans PromotionUsage

**Gestion des erreurs :**
- Code invalide → 422 avec message
- Conditions non remplies → 422 avec message détaillé
- Montant minimum non atteint → 422 avec montant requis

## Form Requests

### StorePromotionRequest

Validation pour création :

**Règles principales :**
- `code` : requis, unique, 50 max, regex [A-Z0-9_-]+
- `name` : requis, string, 255 max
- `discount_type` : requis, in [percentage, fixed_amount, free_delivery]
- `discount_value` : requis, numeric, min:0, max:100 si percentage
- `starts_at` : nullable, date
- `expires_at` : nullable, date, after:starts_at

**Préparation automatique :**
- Code converti en majuscules
- Valeurs par défaut : is_active=true, first_order_only=false, usage_limit_per_user=1

**Messages en français** pour toutes les erreurs.

### UpdatePromotionRequest

Similaire à StorePromotionRequest mais :
- Utilise `sometimes` pour mise à jour partielle
- Ignore le code actuel dans le check d'unicité
- Récupère l'ID depuis la route

### ValidatePromoCodeRequest

Validation simple pour endpoint public :
- `code` : requis
- `order_amount` : requis, numeric, min:0
- `delivery_fee` : nullable, numeric, min:0

Conversion automatique du code en majuscules.

## Routes API

**Routes publiques (routes/api.php) :**
```php
// Validation de code promo
Route::post('validate-promo-code', [PromotionController::class, 'validatePromoCode']);
```

**Routes protégées (auth:api + check.token.expiration) :**
```php
// CRUD Promotions (Admin/Manager uniquement)
Route::get('promotions', [PromotionController::class, 'index']);
Route::post('promotions', [PromotionController::class, 'store']);
Route::get('promotions/{id}', [PromotionController::class, 'show']);
Route::put('promotions/{id}', [PromotionController::class, 'update']);
Route::delete('promotions/{id}', [PromotionController::class, 'destroy']);
Route::get('promotions/{id}/usages', [PromotionController::class, 'usages']);
```

## Exemples d'Utilisation

### 1. Créer une Promotion (Admin)

**Request :**
```http
POST /api/promotions
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SUMMER2026",
  "name": "Promotion Été 2026",
  "description": "10% de réduction sur toutes les commandes",
  "discount_type": "percentage",
  "discount_value": 10,
  "minimum_order_amount": 5000,
  "maximum_discount": 2000,
  "usage_limit_total": 100,
  "usage_limit_per_user": 1,
  "starts_at": "2026-06-01 00:00:00",
  "expires_at": "2026-08-31 23:59:59",
  "is_active": true,
  "first_order_only": false
}
```

**Response :**
```json
{
  "message": "Promotion créée avec succès.",
  "promotion": {
    "id": 1,
    "code": "SUMMER2026",
    "name": "Promotion Été 2026",
    ...
  }
}
```

### 2. Valider un Code Promo (Public)

**Request :**
```http
POST /api/validate-promo-code
Content-Type: application/json

{
  "code": "SUMMER2026",
  "order_amount": 10000,
  "delivery_fee": 500
}
```

**Response (Valide) :**
```json
{
  "valid": true,
  "promotion": {
    "id": 1,
    "code": "SUMMER2026",
    "name": "Promotion Été 2026",
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_description": "10% de réduction (maximum 2 000 CFA)",
    "discount_amount": 1000
  },
  "discount_amount": 1000,
  "message": "Code promotionnel valide! Vous économisez 1 000 CFA."
}
```

**Response (Invalide) :**
```json
{
  "valid": false,
  "error": "Code promotionnel invalide."
}
```

### 3. Passer Commande avec Code Promo

**Request :**
```http
POST /api/add-order-with-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 1,
  "address": "Dakar, Sénégal",
  "promotion_code": "SUMMER2026",
  "delivery_fee": 500
}
```

La réduction est automatiquement calculée et appliquée.

### 4. Commande Invité avec Promo

**Request :**
```http
POST /api/guest-order
Content-Type: application/json

{
  "guest_first_name": "Jean",
  "guest_last_name": "Dupont",
  "guest_phone_number": "+221771234567",
  "guest_email": "jean@example.com",
  "address": "Dakar",
  "cart_items": [...],
  "promotion_code": "SUMMER2026"
}
```

## Logique de Validation

### Ordre de Vérification

Quand un code promo est appliqué, le système vérifie dans cet ordre :

1. **Le code existe** → Sinon : "Code promotionnel invalide"
2. **Promotion active** (`is_active = true`)
3. **Dans la période de validité** (entre starts_at et expires_at)
4. **Limite totale non atteinte** (`usage_count < usage_limit_total`)
5. **Utilisateur peut l'utiliser** :
   - Limite par utilisateur respectée
   - Condition "première commande" respectée
   - Invités ne peuvent pas utiliser "first_order_only"
6. **Montant minimum atteint** → Sinon : message avec montant requis
7. **Calcul de la réduction** selon le type

### Types de Réduction

**Percentage :**
```php
$discount = ($orderAmount * $discount_value) / 100;
if ($maximum_discount && $discount > $maximum_discount) {
    $discount = $maximum_discount;
}
```

**Fixed Amount :**
```php
$discount = min($discount_value, $orderAmount);
```

**Free Delivery :**
```php
$discount = $deliveryFee;
```

## Sécurité

### Prévention des Abus

1. **Limites d'utilisation** :
   - Totale (usage_limit_total)
   - Par utilisateur (usage_limit_per_user)
   - Incrémentation atomique (protection contre race conditions)

2. **Validation stricte** :
   - Code unique en base
   - Regex sur le code (majuscules, chiffres, - et _ seulement)
   - Dates validées (expires_at après starts_at)

3. **Audit complet** :
   - Chaque utilisation enregistrée dans promotion_usages
   - Logs détaillés de toutes les opérations
   - Traçabilité user_id + order_id

4. **Contrôle d'accès** :
   - CRUD réservé aux Admin/Manager
   - Validation publique ouverte (mais rate limiting recommandé)
   - Token expiration vérifiée

### Protection des Données

1. **Suppression de promotion** :
   - SET NULL sur orders.promotion_id
   - CASCADE sur promotion_usages
   - Préservation de promotion_code et discount_amount

2. **Suppression d'utilisateur** :
   - SET NULL sur promotion_usages.user_id
   - Historique préservé

## Logging

Tous les événements importants sont loggés :

**Info :**
- Création de promotion
- Mise à jour de promotion
- Suppression de promotion
- Application de promotion à une commande
- Enregistrement d'utilisation

**Warning :**
- Code invalide
- Conditions non remplies
- Montant minimum non atteint

**Error :**
- Erreurs de base de données
- Erreurs de validation inattendue

Format :
```php
Log::info('Promotion applied to order', [
    'promotion_id' => $promotion->id,
    'order_id' => $order->id,
    'discount_amount' => $discountAmount,
    'user_id' => $user->id
]);
```

## Tests Recommandés

### Tests Unitaires (Promotion Model)

1. `isValid()` avec différents scénarios :
   - Promotion active dans période
   - Promotion inactive
   - Période non commencée
   - Période expirée
   - Limite atteinte

2. `canBeUsedBy()` :
   - Utilisateur authentifié
   - Utilisateur invité
   - Première commande
   - Limite par utilisateur

3. `calculateDiscount()` :
   - Pourcentage sans maximum
   - Pourcentage avec maximum
   - Montant fixe
   - Livraison gratuite
   - Montant minimum non atteint

### Tests d'Intégration (API)

1. **CRUD Promotions** :
   - Création valide
   - Création avec code dupliqué
   - Mise à jour partielle
   - Suppression

2. **Validation Code** :
   - Code valide
   - Code inexistant
   - Code expiré
   - Limite atteinte
   - Montant insuffisant

3. **Application Commande** :
   - Commande avec code valide
   - Commande invité avec code
   - Vérification discount_amount
   - Vérification usage_count incrémenté

## Évolutions Futures

### Fonctionnalités Planifiées

1. **Ciblage Avancé** (`applicable_to`) :
   - Promotions sur catégories spécifiques
   - Promotions sur produits spécifiques
   - Promotions sur types de box

2. **Promotions Automatiques** :
   - Application automatique des meilleures promos
   - Codes génériques (ex: "NOUVEAUCLIENT")

3. **Statistiques Avancées** :
   - Tableau de bord promotions
   - ROI par promotion
   - Graphiques d'utilisation

4. **Notifications** :
   - Email quand promotion utilisée
   - Alerte admin si limite proche
   - SMS avec codes promo

5. **A/B Testing** :
   - Tester plusieurs versions d'une promo
   - Métriques de conversion

## Migration

Les migrations sont dans :
- `2026_02_08_203902_create_promotions_table.php`
- `2026_02_08_204013_create_promotion_usages_table.php`
- `2026_02_08_204056_add_promotion_columns_to_orders_table.php`

**Commandes :**
```bash
php artisan migrate
```

**Rollback :**
```bash
php artisan migrate:rollback --step=3
```

## Support

Pour toute question sur l'implémentation :
1. Consulter cette documentation
2. Vérifier les logs Laravel
3. Tester avec Postman/Insomnia
4. Vérifier les tables en base de données

## Conclusion

Le système de promotions est complet, sécurisé et extensible. Il gère tous les cas d'usage courants :
- Commandes authentifiées et invités
- Multiples types de réductions
- Limites d'utilisation
- Périodes de validité
- Audit trail complet

Le code suit les conventions Laravel et les bonnes pratiques de l'industrie.
