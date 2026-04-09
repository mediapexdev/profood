# Design : App Mobile Livreur Profood (Phase 1 — Mock Data)

**Date :** 2026-03-08
**Statut :** Validé
**Approche :** Capacitor + React + Tailwind, données mockées via hooks

## Contexte

Profood a besoin d'une app mobile pour ses livreurs. 9 designs Stitch existent déjà. Cette phase 1 implémente l'ensemble des écrans avec des données mockées (fichiers JSON + custom hooks), sans toucher à l'API Laravel. L'objectif est de valider le parcours utilisateur complet avant de développer les endpoints API.

## Décisions

- **Stack :** Capacitor + React 18 + Tailwind CSS + React Router v6
- **Scope :** Les 9 écrans des designs Stitch
- **Données :** Fichiers JSON mockés + custom hooks (useDeliveries, useAuth...)
- **Navigation :** Bottom tabs (Missions, Revenus, Profil, Notifications) + React Router
- **Design system :** Tokens Stitch (primary #e37025, Work Sans, Material Symbols Outlined)
- **Pas de Context providers** dans cette phase — hooks avec useState suffisent

## Architecture

```
profood-livreur-app/
├── src/
│   ├── components/        # BottomNav, StatusBadge, DeliveryCard...
│   ├── pages/             # 9 écrans (1 par design Stitch)
│   ├── hooks/             # useAuth, useDeliveries, useNotifications, useStats
│   ├── mocks/             # JSON statiques
│   ├── types/             # Interfaces TypeScript
│   ├── routes/            # Config React Router
│   └── App.tsx
├── capacitor.config.ts
├── tailwind.config.ts
└── package.json
```

## Écrans et routing

| # | Écran | Route | Bottom tabs |
|---|-------|-------|-------------|
| 1 | Connexion | `/login` | Non |
| 2 | Dashboard | `/` | Missions |
| 3 | Liste tournée | `/tournee` | Missions |
| 4 | Carte itinéraire | `/tournee/carte` | Missions |
| 5 | Détails livraison | `/livraison/:id` | Missions |
| 6 | Confirmation | `/livraison/:id/confirmation` | Missions |
| 7 | Signalement | `/livraison/:id/signalement` | Missions |
| 8 | Historique | `/historique` | Missions |
| 9 | Notifications | `/notifications` | Notifications |

Onglets Revenus et Profil : pages placeholder "Bientôt disponible".

## Flux utilisateur principal

Login → Dashboard → Tournée → Détails → Confirmation (ou Signalement) → Retour Dashboard

## Types TypeScript

```typescript
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Delivery {
  id: string;
  orderRef: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'issue';
  customer: { name: string; phone: string; avatar?: string };
  address: { street: string; city: string; coordinates?: [number, number] };
  items: { name: string; quantity: number; weight?: string }[];
  scheduledTime: string;
  estimatedDuration: string;
  amount: number;
  notes?: string;
}

interface Notification {
  id: string;
  type: 'delivery' | 'schedule' | 'message' | 'payment' | 'alert';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface DailyStats {
  deliveriesCompleted: number;
  deliveriesRemaining: number;
  totalAmount: number;
  averageTime: string;
}
```

## Données mockées

| Fichier | Contenu |
|---------|---------|
| `mocks/deliveries.json` | 6-8 livraisons, statuts variés |
| `mocks/notifications.json` | 5-6 notifications, types variés |
| `mocks/driver.json` | Profil livreur connecté |
| `mocks/stats.json` | Stats du jour |

## Hooks

| Hook | Responsabilité |
|------|---------------|
| `useAuth()` | Login mock (tout accepté), state driver, logout |
| `useDeliveries()` | Liste, détail par ID, update status |
| `useNotifications()` | Liste, filtres par type, marquer comme lu |
| `useStats()` | Stats dashboard du jour |

## Design system (tokens Stitch)

```typescript
// tailwind.config.ts
colors: {
  primary: '#e37025',
  'background-light': '#f8f6f6',
  'background-dark': '#201212',
}
fontFamily: {
  display: ['Work Sans']
}
```

Icônes : Material Symbols Outlined (via Google Fonts CDN)

## Transition vers l'API (phase 2)

Quand l'API sera prête, la migration sera minimale :
1. Remplacer les imports JSON par des appels axios dans les hooks
2. Ajouter un AuthContext pour gérer le token Firebase → API
3. Les pages ne changent pas du tout

## Ce qui n'est PAS dans cette phase

- Authentification Firebase réelle
- Appels API Laravel
- GPS / géolocalisation réelle
- Carte interactive (placeholder image statique)
- Push notifications
- Mode offline
- Internationalisation (FR uniquement)
