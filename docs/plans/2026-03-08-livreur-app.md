# Profood Livreur App — Implementation Plan (Phase 1: Mock Data)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete delivery driver mobile app with 9 screens using mock data, ready for API integration later.

**Architecture:** Vite + React 18 + TypeScript + Tailwind CSS + React Router v6 + Capacitor. All data comes from JSON mock files accessed via custom hooks. Pages never import mocks directly.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS 3, React Router 6, Capacitor 6, Material Symbols Outlined icons

**Design reference files:** `/Users/ibrahima/Documents/perso/profood/stitch-designs/01-connexion.html` through `09-notifications.html`

---

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `profood-livreur-app/package.json`
- Create: `profood-livreur-app/vite.config.ts`
- Create: `profood-livreur-app/tsconfig.json`
- Create: `profood-livreur-app/index.html`
- Create: `profood-livreur-app/src/main.tsx`
- Create: `profood-livreur-app/src/App.tsx`

**Step 1: Create the project with Vite**

```bash
cd /Users/ibrahima/Documents/perso/profood
npm create vite@latest profood-livreur-app -- --template react-ts
```

**Step 2: Install dependencies**

```bash
cd /Users/ibrahima/Documents/perso/profood/profood-livreur-app
npm install react-router-dom@6
npm install -D tailwindcss @tailwindcss/vite
```

**Step 3: Configure Tailwind via Vite plugin**

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace `src/index.css` with:

```css
@import "tailwindcss";

@theme {
  --color-primary: #e37025;
  --color-background-light: #f8f6f6;
  --color-background-dark: #201212;
  --font-display: "Work Sans", sans-serif;
}
```

**Step 4: Add Material Symbols font to index.html**

Add to `<head>` in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

Also set the viewport meta and lang:

```html
<html lang="fr">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**Step 5: Minimal App.tsx placeholder**

```tsx
function App() {
  return <div className="font-display bg-background-light min-h-screen">Profood Livreur</div>
}
export default App
```

**Step 6: Verify it builds**

```bash
npm run dev
# Visit http://localhost:5173, should see "Profood Livreur" with correct font
# Ctrl+C to stop
npm run build
# Should succeed with no errors
```

**Step 7: Initialize git repo and commit**

```bash
cd /Users/ibrahima/Documents/perso/profood/profood-livreur-app
git init
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add .
git commit -m "Scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: Types TypeScript and mock data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/mocks/driver.json`
- Create: `src/mocks/deliveries.json`
- Create: `src/mocks/notifications.json`
- Create: `src/mocks/stats.json`

**Step 1: Create types**

Create `src/types/index.ts`:

```typescript
export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface DeliveryCustomer {
  name: string
  phone: string
  avatar?: string
}

export interface DeliveryAddress {
  street: string
  city: string
  coordinates?: [number, number]
}

export interface DeliveryItem {
  name: string
  quantity: number
  weight?: string
}

export interface Delivery {
  id: string
  orderRef: string
  status: DeliveryStatus
  customer: DeliveryCustomer
  address: DeliveryAddress
  items: DeliveryItem[]
  scheduledTime: string
  estimatedDuration: string
  amount: number
  notes?: string
  stopNumber?: number
}

export type DeliveryStatus = 'pending' | 'in_progress' | 'delivered' | 'issue'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  time: string
  read: boolean
  actions?: NotificationAction[]
}

export type NotificationType = 'delivery' | 'schedule' | 'message' | 'payment' | 'alert'

export interface NotificationAction {
  label: string
  variant: 'primary' | 'secondary'
}

export interface DailyStats {
  deliveriesTotal: number
  deliveriesGrouped: number
  deliveriesIndividual: number
  deliveriesCompleted: number
  deliveriesInProgress: number
  deliveriesPending: number
  deliveriesWithIssues: number
  totalDistance: string
  averageTime: string
  totalAmount: number
}
```

**Step 2: Create mock data files**

Create `src/mocks/driver.json`:

```json
{
  "id": "drv-001",
  "name": "Mamadou Diallo",
  "email": "mamadou@profood-app.com",
  "phone": "+221 77 123 45 67",
  "avatar": null
}
```

Create `src/mocks/deliveries.json`:

```json
[
  {
    "id": "del-001",
    "orderRef": "PF-4529",
    "status": "in_progress",
    "customer": { "name": "Fatou Sow", "phone": "+221 78 234 56 78" },
    "address": { "street": "23 Rue Carnot", "city": "Dakar Plateau", "coordinates": [14.6928, -17.4467] },
    "items": [
      { "name": "Box Familiale Bœuf", "quantity": 1, "weight": "2.5 kg" },
      { "name": "Box Brochettes", "quantity": 2, "weight": "1.2 kg" }
    ],
    "scheduledTime": "10:30",
    "estimatedDuration": "15 min",
    "amount": 25000,
    "stopNumber": 1,
    "notes": "Sonner au 3ème étage, code porte 4521"
  },
  {
    "id": "del-002",
    "orderRef": "PF-4530",
    "status": "pending",
    "customer": { "name": "Ibrahima Ndiaye", "phone": "+221 76 345 67 89" },
    "address": { "street": "45 Avenue Bourguiba", "city": "Dakar Médina", "coordinates": [14.6866, -17.4414] },
    "items": [
      { "name": "Box Grillade Premium", "quantity": 1, "weight": "3.0 kg" }
    ],
    "scheduledTime": "11:00",
    "estimatedDuration": "20 min",
    "amount": 35000,
    "stopNumber": 2
  },
  {
    "id": "del-003",
    "orderRef": "PF-4531",
    "status": "pending",
    "customer": { "name": "Aïssatou Ba", "phone": "+221 77 456 78 90" },
    "address": { "street": "12 Rue de Thiès", "city": "Dakar Fann", "coordinates": [14.6937, -17.4618] },
    "items": [
      { "name": "Box Poulet Braisé", "quantity": 2, "weight": "1.8 kg" },
      { "name": "Box Merguez", "quantity": 1, "weight": "0.8 kg" }
    ],
    "scheduledTime": "11:30",
    "estimatedDuration": "10 min",
    "amount": 22000,
    "stopNumber": 3
  },
  {
    "id": "del-004",
    "orderRef": "PF-4532",
    "status": "pending",
    "customer": { "name": "Ousmane Fall", "phone": "+221 78 567 89 01" },
    "address": { "street": "8 Boulevard de la République", "city": "Dakar", "coordinates": [14.6880, -17.4380] },
    "items": [
      { "name": "Box Familiale Mixte", "quantity": 1, "weight": "4.0 kg" }
    ],
    "scheduledTime": "12:00",
    "estimatedDuration": "15 min",
    "amount": 45000,
    "stopNumber": 4
  },
  {
    "id": "del-005",
    "orderRef": "PF-4525",
    "status": "delivered",
    "customer": { "name": "Marie Diouf", "phone": "+221 76 678 90 12" },
    "address": { "street": "56 Rue Vincens", "city": "Dakar Plateau", "coordinates": [14.6915, -17.4450] },
    "items": [
      { "name": "Box Agneau", "quantity": 1, "weight": "2.0 kg" }
    ],
    "scheduledTime": "09:00",
    "estimatedDuration": "10 min",
    "amount": 30000,
    "stopNumber": 5
  },
  {
    "id": "del-006",
    "orderRef": "PF-4520",
    "status": "issue",
    "customer": { "name": "Cheikh Mbaye", "phone": "+221 77 789 01 23" },
    "address": { "street": "3 Avenue Lamine Guèye", "city": "Dakar", "coordinates": [14.6900, -17.4400] },
    "items": [
      { "name": "Box Découverte", "quantity": 3, "weight": "1.5 kg" }
    ],
    "scheduledTime": "09:30",
    "estimatedDuration": "15 min",
    "amount": 18000,
    "stopNumber": 6,
    "notes": "Client absent — signalement envoyé"
  }
]
```

Create `src/mocks/notifications.json`:

```json
[
  {
    "id": "notif-001",
    "type": "delivery",
    "title": "Nouvelle livraison assignée",
    "body": "Commande #PF-4529 - Restaurant 'Le Gourmet'",
    "time": "À l'instant",
    "read": false,
    "actions": [
      { "label": "Accepter", "variant": "primary" },
      { "label": "Détails", "variant": "secondary" }
    ]
  },
  {
    "id": "notif-002",
    "type": "schedule",
    "title": "Changement d'horaire",
    "body": "Votre shift du 24/10 a été modifié. Nouvel horaire : 11:30 - 15:30.",
    "time": "Il y a 1h",
    "read": false
  },
  {
    "id": "notif-003",
    "type": "message",
    "title": "Message du Dispatch",
    "body": "Attention, travaux sur l'avenue de la République. Privilégiez l'itinéraire par le sud.",
    "time": "Il y a 3h",
    "read": false
  },
  {
    "id": "notif-004",
    "type": "payment",
    "title": "Revenus validés",
    "body": "Vos revenus pour la journée du 22/10 ont été validés (42 500 FCFA).",
    "time": "Hier",
    "read": true
  },
  {
    "id": "notif-005",
    "type": "alert",
    "title": "Rappel équipement",
    "body": "N'oubliez pas de charger votre batterie externe avant votre prochain shift.",
    "time": "Hier",
    "read": true
  }
]
```

Create `src/mocks/stats.json`:

```json
{
  "deliveriesTotal": 24,
  "deliveriesGrouped": 8,
  "deliveriesIndividual": 16,
  "deliveriesCompleted": 5,
  "deliveriesInProgress": 1,
  "deliveriesPending": 3,
  "deliveriesWithIssues": 1,
  "totalDistance": "12.4 km",
  "averageTime": "14 min",
  "totalAmount": 175000
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/types/ src/mocks/
git commit -m "Add TypeScript types and mock data for all screens"
```

---

### Task 3: Custom hooks (useAuth, useDeliveries, useNotifications, useStats)

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useDeliveries.ts`
- Create: `src/hooks/useNotifications.ts`
- Create: `src/hooks/useStats.ts`

**Step 1: Create useAuth hook**

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useCallback } from 'react'
import type { Driver } from '../types'
import driverData from '../mocks/driver.json'

interface UseAuthReturn {
  driver: Driver | null
  isAuthenticated: boolean
  login: (phone: string, pin: string) => Promise<boolean>
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const [driver, setDriver] = useState<Driver | null>(() => {
    const saved = sessionStorage.getItem('profood-driver')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (_phone: string, _pin: string): Promise<boolean> => {
    // Mock: accept any credentials
    await new Promise((r) => setTimeout(r, 500))
    setDriver(driverData as Driver)
    sessionStorage.setItem('profood-driver', JSON.stringify(driverData))
    return true
  }, [])

  const logout = useCallback(() => {
    setDriver(null)
    sessionStorage.removeItem('profood-driver')
  }, [])

  return { driver, isAuthenticated: driver !== null, login, logout }
}
```

**Step 2: Create useDeliveries hook**

Create `src/hooks/useDeliveries.ts`:

```typescript
import { useState, useCallback, useMemo } from 'react'
import type { Delivery, DeliveryStatus } from '../types'
import deliveriesData from '../mocks/deliveries.json'

interface UseDeliveriesReturn {
  deliveries: Delivery[]
  getDelivery: (id: string) => Delivery | undefined
  updateStatus: (id: string, status: DeliveryStatus) => void
  activeDeliveries: Delivery[]
  completedDeliveries: Delivery[]
}

export function useDeliveries(): UseDeliveriesReturn {
  const [deliveries, setDeliveries] = useState<Delivery[]>(deliveriesData as Delivery[])

  const getDelivery = useCallback(
    (id: string) => deliveries.find((d) => d.id === id),
    [deliveries]
  )

  const updateStatus = useCallback((id: string, status: DeliveryStatus) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    )
  }, [])

  const activeDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'pending' || d.status === 'in_progress'),
    [deliveries]
  )

  const completedDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'delivered' || d.status === 'issue'),
    [deliveries]
  )

  return { deliveries, getDelivery, updateStatus, activeDeliveries, completedDeliveries }
}
```

**Step 3: Create useNotifications hook**

Create `src/hooks/useNotifications.ts`:

```typescript
import { useState, useCallback, useMemo } from 'react'
import type { Notification, NotificationType } from '../types'
import notificationsData from '../mocks/notifications.json'

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  filterByType: (type: NotificationType | 'all') => Notification[]
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationsData as Notification[]
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const filterByType = useCallback(
    (type: NotificationType | 'all') => {
      if (type === 'all') return notifications
      return notifications.filter((n) => n.type === type)
    },
    [notifications]
  )

  return { notifications, unreadCount, markAsRead, markAllAsRead, filterByType }
}
```

**Step 4: Create useStats hook**

Create `src/hooks/useStats.ts`:

```typescript
import type { DailyStats } from '../types'
import statsData from '../mocks/stats.json'

export function useStats(): DailyStats {
  return statsData as DailyStats
}
```

**Step 5: Verify build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/hooks/
git commit -m "Add custom hooks for auth, deliveries, notifications, stats"
```

---

### Task 4: Shared components (Icon, BottomNav, StatusBadge)

**Files:**
- Create: `src/components/Icon.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/PageHeader.tsx`

**Step 1: Create Icon component**

This wraps Material Symbols Outlined for consistent usage.

Create `src/components/Icon.tsx`:

```tsx
interface IconProps {
  name: string
  filled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export function Icon({ name, filled = false, className = '', size = 'md' }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
```

**Step 2: Create BottomNav component**

Create `src/components/BottomNav.tsx`:

```tsx
import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

interface Tab {
  to: string
  icon: string
  label: string
}

const tabs: Tab[] = [
  { to: '/', icon: 'local_shipping', label: 'Missions' },
  { to: '/revenus', icon: 'account_balance_wallet', label: 'Revenus' },
  { to: '/profil', icon: 'person', label: 'Profil' },
  { to: '/notifications', icon: 'notifications', label: 'Notifications' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 pb-6 pt-2 z-50">
      <div className="flex max-w-lg mx-auto w-full">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} filled={isActive} />
                <p className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</p>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

**Step 3: Create StatusBadge component**

Create `src/components/StatusBadge.tsx`:

```tsx
import type { DeliveryStatus } from '../types'

const statusConfig: Record<DeliveryStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'En attente', bg: 'bg-amber-100', text: 'text-amber-700' },
  in_progress: { label: 'En cours', bg: 'bg-primary/10', text: 'text-primary' },
  delivered: { label: 'Livré', bg: 'bg-green-100', text: 'text-green-700' },
  issue: { label: 'Problème', bg: 'bg-red-100', text: 'text-red-700' },
}

interface StatusBadgeProps {
  status: DeliveryStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}
```

**Step 4: Create PageHeader component**

Create `src/components/PageHeader.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary/10 px-4 py-4">
      <div className="flex items-center justify-between max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors"
            >
              <Icon name="arrow_back" />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        {rightAction}
      </div>
    </header>
  )
}
```

**Step 5: Verify build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/components/
git commit -m "Add shared components: Icon, BottomNav, StatusBadge, PageHeader"
```

---

### Task 5: Login page

**Files:**
- Create: `src/pages/LoginPage.tsx`

**Reference:** `stitch-designs/01-connexion.html`

**Step 1: Create LoginPage**

Create `src/pages/LoginPage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(phone, pin)
    setLoading(false)
    if (success) navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background-light font-display flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center pt-12 pb-6 px-4">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary mb-4">
            <Icon name="local_shipping" className="text-white" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Profood</h1>
          <p className="text-sm text-primary font-semibold mt-1">Espace Livreur</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 gap-4">
          {/* Phone input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="phone_iphone" />
            </div>
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* PIN input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="lock_open" />
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              placeholder="Code PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 tracking-[0.5em] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <Icon name={showPin ? 'visibility_off' : 'visibility'} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="animate-spin"><Icon name="progress_activity" /></span>
            ) : (
              <>
                <Icon name="login" />
                Se connecter
              </>
            )}
          </button>

          {/* Help link */}
          <div className="text-center mt-4">
            <button type="button" className="text-sm text-primary font-medium flex items-center justify-center gap-1 mx-auto">
              <Icon name="help_outline" size="sm" />
              Besoin d'aide ?
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-slate-400">
          Profood Livreur v1.0
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "Add login page with phone + PIN form"
```

---

### Task 6: Dashboard page

**Files:**
- Create: `src/pages/DashboardPage.tsx`

**Reference:** `stitch-designs/02-tableau-de-bord.html`

**Step 1: Create DashboardPage**

Create `src/pages/DashboardPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useDeliveries } from '../hooks/useDeliveries'
import { useStats } from '../hooks/useStats'
import { useNotifications } from '../hooks/useNotifications'

export function DashboardPage() {
  const { driver } = useAuth()
  const stats = useStats()
  const { activeDeliveries } = useDeliveries()
  const { unreadCount } = useNotifications()

  return (
    <div className="font-display bg-background-light min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center">
              <Icon name="local_shipping" className="text-white" size="sm" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bonjour,</p>
              <p className="font-bold text-slate-900">{driver?.name ?? 'Livreur'}</p>
            </div>
          </div>
          <Link to="/notifications" className="relative p-2 hover:bg-primary/5 rounded-full">
            <Icon name="notifications" className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 size-2.5 bg-red-500 rounded-full" />
            )}
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full">
        {/* Hero Stats */}
        <div className="mx-4 mt-4 bg-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Aujourd'hui</p>
              <p className="text-4xl font-bold mt-1">{stats.deliveriesTotal}</p>
              <p className="text-white/80 text-sm">Livraisons</p>
            </div>
            <Icon name="local_shipping" className="text-white/20" size="xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-2xl font-bold">{String(stats.deliveriesGrouped).padStart(2, '0')}</p>
              <p className="text-white/70 text-xs">Groupées</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{String(stats.deliveriesIndividual).padStart(2, '0')}</p>
              <p className="text-white/70 text-xs">Individuelles</p>
            </div>
          </div>
        </div>

        {/* Start Tour Button */}
        <div className="mx-4 mt-4">
          <Link
            to="/tournee"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Icon name="play_circle" />
            Démarrer la tournée
          </Link>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mx-4 mt-6">
          {[
            { icon: 'schedule', label: 'En attente', value: stats.deliveriesPending, bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
            { icon: 'check_circle', label: 'En cours', value: stats.deliveriesInProgress, bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
            { icon: 'task_alt', label: 'Livrées', value: stats.deliveriesCompleted, bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
            { icon: 'warning', label: 'Problèmes', value: stats.deliveriesWithIssues, bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} rounded-xl p-4 border border-primary/5`}>
              <div className={`size-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                <Icon name={card.icon} className={card.iconColor} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Route Info */}
        <div className="mx-4 mt-6 bg-white rounded-xl p-4 border border-primary/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="route" className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Distance totale</p>
              <p className="text-sm text-slate-500">{stats.totalDistance}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">~{stats.averageTime}</p>
              <p className="text-sm text-slate-500">par livraison</p>
            </div>
          </div>
        </div>

        {/* Next Deliveries */}
        <div className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Prochaines livraisons</h2>
            <Link to="/tournee" className="text-sm text-primary font-medium">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {activeDeliveries.slice(0, 3).map((delivery) => (
              <Link
                key={delivery.id}
                to={`/livraison/${delivery.id}`}
                className="bg-white rounded-xl p-4 border-l-4 border-primary shadow-sm flex items-center gap-4 block"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {delivery.stopNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 truncate">{delivery.customer.name}</p>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{delivery.scheduledTime} · {delivery.estimatedDuration}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <Icon name="location_on" size="sm" />
                    <span className="text-xs truncate">{delivery.address.street}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "Add dashboard page with stats, status cards, and delivery list"
```

---

### Task 7: Tour list page + Delivery details page

**Files:**
- Create: `src/pages/TourListPage.tsx`
- Create: `src/pages/DeliveryDetailsPage.tsx`

**Reference:** `stitch-designs/03-liste-tournee.html`, `stitch-designs/05-details-livraison.html`

**Step 1: Create TourListPage**

Create `src/pages/TourListPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'
import { useStats } from '../hooks/useStats'

export function TourListPage() {
  const { deliveries } = useDeliveries()
  const stats = useStats()
  const sortedDeliveries = [...deliveries].sort((a, b) => (a.stopNumber ?? 0) - (b.stopNumber ?? 0))

  return (
    <div className="font-display bg-background-light min-h-screen pb-24">
      <PageHeader
        title="Ma Tournée"
        rightAction={
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors text-primary">
            <Icon name="sync" />
          </button>
        }
      />

      <main className="max-w-lg mx-auto w-full">
        {/* Distance badge */}
        <div className="mx-4 mt-4 flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 w-fit">
          <Icon name="route" className="text-primary" size="sm" />
          <span className="text-sm font-semibold text-primary">{stats.totalDistance} restants</span>
        </div>

        {/* Optimize button */}
        <div className="mx-4 mt-3">
          <Link
            to="/tournee/carte"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Icon name="map" />
            Voir sur la carte
          </Link>
        </div>

        {/* Stops header */}
        <div className="mx-4 mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Arrêts ordonnés</h2>
          <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
            {deliveries.length} Clients
          </span>
        </div>

        {/* Stops list */}
        <div className="mx-4 mt-3 space-y-3 pb-8">
          {sortedDeliveries.map((delivery, index) => (
            <Link
              key={delivery.id}
              to={`/livraison/${delivery.id}`}
              className="block bg-white rounded-xl p-4 border-l-4 border-primary shadow-sm relative"
            >
              {/* Connector line */}
              {index < sortedDeliveries.length - 1 && (
                <div className="absolute left-[2.05rem] top-[3.5rem] bottom-[-0.75rem] w-0.5 bg-primary/20 z-0" />
              )}

              <div className="flex items-start gap-4 relative z-10">
                {/* Stop number */}
                <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {delivery.stopNumber ?? index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{delivery.customer.name}</p>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{delivery.orderRef} · {delivery.scheduledTime}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <Icon name="location_on" size="sm" />
                    <span className="text-xs truncate">{delivery.address.street}, {delivery.address.city}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    {delivery.items.map((item, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">
                        {item.quantity}x {item.name}
                      </span>
                    )).slice(0, 2)}
                    {delivery.items.length > 2 && (
                      <span className="text-primary font-medium">+{delivery.items.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Create DeliveryDetailsPage**

Create `src/pages/DeliveryDetailsPage.tsx`:

```tsx
import { useParams, Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'

export function DeliveryDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { getDelivery, updateStatus } = useDeliveries()
  const delivery = getDelivery(id!)

  if (!delivery) {
    return (
      <div className="font-display bg-background-light min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Livraison introuvable</p>
      </div>
    )
  }

  return (
    <div className="font-display bg-background-light min-h-screen pb-24">
      <PageHeader title="Détails de la livraison" showBack />

      <main className="max-w-lg mx-auto w-full">
        {/* Customer card */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-5 border border-primary/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <Icon name="person" className="text-primary" size="lg" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-slate-900">{delivery.customer.name}</p>
              <p className="text-sm text-slate-500">{delivery.customer.phone}</p>
              <div className="mt-1">
                <StatusBadge status={delivery.status} />
              </div>
            </div>
            <a
              href={`tel:${delivery.customer.phone}`}
              className="size-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Icon name="call" className="text-white" />
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-primary/5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="location_on" className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{delivery.address.street}</p>
              <p className="text-sm text-slate-500">{delivery.address.city}</p>
            </div>
          </div>
        </div>

        {/* Order ref + time */}
        <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-primary/5 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Commande</p>
            <p className="font-bold text-slate-900 mt-1">{delivery.orderRef}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-primary/5 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Horaire</p>
            <p className="font-bold text-slate-900 mt-1">{delivery.scheduledTime}</p>
          </div>
        </div>

        {/* Items list */}
        <div className="mx-4 mt-4">
          <h3 className="font-bold text-slate-900 mb-3">Contenu de la commande</h3>
          <div className="space-y-2">
            {delivery.items.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-primary/5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="inventory_2" className="text-primary" size="sm" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.weight && <p className="text-xs text-slate-500">{item.weight}</p>}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {delivery.notes && (
          <div className="mx-4 mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <Icon name="info" className="text-amber-600" size="sm" />
              <p className="text-sm text-amber-800">{delivery.notes}</p>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-primary/5 shadow-sm flex items-center justify-between">
          <p className="font-semibold text-slate-900">Montant total</p>
          <p className="text-xl font-bold text-primary">{delivery.amount.toLocaleString()} FCFA</p>
        </div>

        {/* Action buttons */}
        <div className="mx-4 mt-6 space-y-3">
          {delivery.status !== 'delivered' && delivery.status !== 'issue' && (
            <>
              <Link
                to={`/livraison/${delivery.id}/confirmation`}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Icon name="check_circle" />
                Confirmer la livraison
              </Link>
              <Link
                to={`/livraison/${delivery.id}/signalement`}
                className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
              >
                <Icon name="report_problem" />
                Signaler un problème
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/TourListPage.tsx src/pages/DeliveryDetailsPage.tsx
git commit -m "Add tour list and delivery details pages"
```

---

### Task 8: Map page + Confirmation page + Issue reporting page

**Files:**
- Create: `src/pages/MapPage.tsx`
- Create: `src/pages/ConfirmationPage.tsx`
- Create: `src/pages/ReportIssuePage.tsx`

**Reference:** `stitch-designs/04-carte.html`, `stitch-designs/06-confirmation.html`, `stitch-designs/07-signalement.html`

**Step 1: Create MapPage (static placeholder)**

Create `src/pages/MapPage.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useDeliveries } from '../hooks/useDeliveries'

export function MapPage() {
  const { activeDeliveries } = useDeliveries()

  return (
    <div className="font-display bg-slate-200 min-h-screen relative">
      {/* Fake map background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Icon name="map" size="xl" />
          <p className="text-sm mt-2">Carte interactive (Phase 2)</p>
        </div>
      </div>

      {/* Header overlay */}
      <div className="relative z-10 p-4 pt-12">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-lg mx-auto">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="route" className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">{activeDeliveries.length} arrêts restants</p>
            <p className="text-sm text-slate-500">Itinéraire optimisé</p>
          </div>
          <button className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon name="layers" className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Map pins (simulated) */}
      <div className="relative z-10 px-4 mt-8 max-w-lg mx-auto">
        <div className="space-y-4">
          {activeDeliveries.map((delivery) => (
            <Link
              key={delivery.id}
              to={`/livraison/${delivery.id}`}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-md"
            >
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {delivery.stopNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{delivery.customer.name}</p>
                <p className="text-xs text-slate-500 truncate">{delivery.address.street}</p>
              </div>
              <Icon name="navigation" className="text-primary" size="sm" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
        <div className="max-w-lg mx-auto">
          <Link
            to="/tournee"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Icon name="list" />
            Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create ConfirmationPage**

Create `src/pages/ConfirmationPage.tsx`:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDeliveries } from '../hooks/useDeliveries'

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDelivery, updateStatus } = useDeliveries()
  const delivery = getDelivery(id!)
  const [isComplete, setIsComplete] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})

  if (!delivery) {
    return (
      <div className="font-display bg-background-light min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Livraison introuvable</p>
      </div>
    )
  }

  const handleConfirm = () => {
    updateStatus(delivery.id, 'delivered')
    navigate('/', { replace: true })
  }

  return (
    <div className="font-display bg-background-light min-h-screen pb-8">
      <PageHeader title="Confirmation de Livraison" showBack />

      <main className="max-w-lg mx-auto w-full">
        {/* Delivery type toggle */}
        <div className="mx-4 mt-4 flex gap-2">
          <button
            onClick={() => setIsComplete(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              isComplete ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-primary/10'
            }`}
          >
            Livraison complète
          </button>
          <button
            onClick={() => setIsComplete(false)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              !isComplete ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-primary/10'
            }`}
          >
            Livraison partielle
          </button>
        </div>

        {/* Photo proof */}
        <div className="mx-4 mt-6">
          <h3 className="font-bold text-slate-900 mb-3">Preuve photo</h3>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className="aspect-square rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors"
              >
                <Icon name="add_a_photo" className="text-primary" />
                <span className="text-[10px] text-primary font-medium">Photo {i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div className="mx-4 mt-6">
          <h3 className="font-bold text-slate-900 mb-3">Signature du client</h3>
          <div className="bg-white rounded-xl border border-primary/10 h-40 flex items-center justify-center relative">
            <div className="text-center text-slate-300">
              <Icon name="draw" size="xl" />
              <p className="text-sm mt-1">Signez ici</p>
            </div>
            <button className="absolute top-2 right-2 size-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Icon name="refresh" className="text-slate-400" size="sm" />
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="mx-4 mt-6">
          <h3 className="font-bold text-slate-900 mb-3">Articles livrés</h3>
          <div className="space-y-2">
            {delivery.items.map((item, i) => (
              <label key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-primary/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedItems[i] ?? isComplete}
                  onChange={(e) => setCheckedItems({ ...checkedItems, [i]: e.target.checked })}
                  className="size-5 rounded border-primary/30 text-primary focus:ring-primary/20"
                />
                <span className="font-medium text-slate-900">{item.quantity}x {item.name}</span>
                {item.weight && <span className="text-xs text-slate-400 ml-auto">{item.weight}</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <div className="mx-4 mt-8">
          <button
            onClick={handleConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Icon name="check_circle" />
            Confirmer la livraison
          </button>
        </div>
      </main>
    </div>
  )
}
```

**Step 3: Create ReportIssuePage**

Create `src/pages/ReportIssuePage.tsx`:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDeliveries } from '../hooks/useDeliveries'

const issueTypes = [
  'Client absent',
  'Adresse introuvable',
  'Produit endommagé',
  'Refus client',
  'Autre',
]

export function ReportIssuePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDelivery, updateStatus } = useDeliveries()
  const delivery = getDelivery(id!)
  const [selectedIssue, setSelectedIssue] = useState(0)
  const [comment, setComment] = useState('')

  if (!delivery) {
    return (
      <div className="font-display bg-background-light min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Livraison introuvable</p>
      </div>
    )
  }

  const handleSubmit = () => {
    updateStatus(delivery.id, 'issue')
    navigate('/', { replace: true })
  }

  return (
    <div className="font-display bg-background-light min-h-screen pb-8">
      <PageHeader title="Signaler un problème" showBack />

      <main className="max-w-lg mx-auto w-full p-4 space-y-6">
        {/* Order context */}
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
          <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">
            Commande {delivery.orderRef}
          </p>
          <p className="text-sm text-slate-600">
            Livraison vers : {delivery.address.street}, {delivery.address.city}
          </p>
        </div>

        {/* Issue type */}
        <section>
          <h3 className="text-lg font-bold mb-3">Quel est le problème ?</h3>
          <div className="flex flex-col gap-3">
            {issueTypes.map((issue, i) => (
              <label
                key={i}
                className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors flex-row-reverse ${
                  selectedIssue === i ? 'border-primary bg-primary/5' : 'border-primary/10 bg-white hover:border-primary/30'
                }`}
              >
                <input
                  type="radio"
                  name="issue-type"
                  checked={selectedIssue === i}
                  onChange={() => setSelectedIssue(i)}
                  className="size-5 border-2 border-primary/30 text-primary focus:ring-primary/20"
                />
                <span className="flex-1 text-sm font-medium text-slate-900">{issue}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Photo proof */}
        <section>
          <h3 className="text-lg font-bold mb-3">Preuve photo (obligatoire)</h3>
          <button className="w-full bg-primary/5 border-2 border-dashed border-primary/20 aspect-video rounded-xl flex flex-col items-center justify-center hover:bg-primary/10 transition-colors">
            <Icon name="add_a_photo" className="text-primary" size="xl" />
            <p className="text-primary font-medium mt-2">Prendre une photo</p>
            <p className="text-slate-500 text-xs px-4 text-center mt-1">
              Ajoutez une photo claire du colis ou de l'adresse
            </p>
          </button>
        </section>

        {/* Comment */}
        <section>
          <h3 className="text-lg font-bold mb-3">Commentaire (facultatif)</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez brièvement la situation..."
            className="w-full h-32 rounded-xl border border-primary/10 bg-white p-4 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-400 resize-none"
          />
        </section>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Icon name="send" />
            Envoyer le rapport
          </button>
          <p className="text-center text-slate-500 text-xs mt-4 italic">
            En envoyant ce rapport, vous confirmez l'exactitude des informations fournies.
          </p>
        </div>
      </main>
    </div>
  )
}
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/pages/MapPage.tsx src/pages/ConfirmationPage.tsx src/pages/ReportIssuePage.tsx
git commit -m "Add map placeholder, confirmation, and issue reporting pages"
```

---

### Task 9: History page + Notifications page + Placeholder pages

**Files:**
- Create: `src/pages/HistoryPage.tsx`
- Create: `src/pages/NotificationsPage.tsx`
- Create: `src/pages/PlaceholderPage.tsx`

**Reference:** `stitch-designs/08-historique.html`, `stitch-designs/09-notifications.html`

**Step 1: Create HistoryPage**

Create `src/pages/HistoryPage.tsx`:

```tsx
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useDeliveries } from '../hooks/useDeliveries'

export function HistoryPage() {
  const { deliveries } = useDeliveries()

  const todayCount = deliveries.filter((d) => d.status === 'delivered').length
  const weekCount = todayCount * 6
  const monthCount = weekCount * 4

  return (
    <div className="font-display bg-background-light min-h-screen pb-24">
      <PageHeader title="Historique des Livraisons" />

      <main className="max-w-lg mx-auto w-full">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {[
            { label: "Aujourd'hui", value: todayCount, trend: '+2%', up: true },
            { label: 'Semaine', value: weekCount, trend: '-5%', up: false },
            { label: 'Ce mois', value: monthCount, trend: '+10%', up: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`text-[10px] font-bold pb-1 ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery list */}
        <section className="px-4 py-4">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            <span>Livraisons passées</span>
            <span className="text-sm font-medium text-primary">Voir tout</span>
          </h3>
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className={`bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border-l-4 ${
                  delivery.status === 'delivered' ? 'border-primary' : 'border-slate-300'
                }`}
              >
                <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Icon name="person" className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800">{delivery.customer.name}</p>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{delivery.scheduledTime}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <Icon name="location_on" size="sm" />
                    <span className="text-xs truncate">{delivery.address.street}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold ${delivery.status === 'delivered' ? 'text-primary' : 'text-slate-400'}`}>
                    {delivery.amount.toLocaleString()} F
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
```

**Step 2: Create NotificationsPage**

Create `src/pages/NotificationsPage.tsx`:

```tsx
import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useNotifications } from '../hooks/useNotifications'
import type { NotificationType } from '../types'

const notifIconConfig: Record<NotificationType, { icon: string; bg: string; text: string }> = {
  delivery: { icon: 'package_2', bg: 'bg-primary', text: 'text-white' },
  schedule: { icon: 'schedule', bg: 'bg-primary/10', text: 'text-primary' },
  message: { icon: 'chat_bubble', bg: 'bg-blue-100', text: 'text-blue-600' },
  payment: { icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-600' },
  alert: { icon: 'warning', bg: 'bg-primary/10', text: 'text-primary' },
}

type TabFilter = 'all' | 'delivery' | 'message'

export function NotificationsPage() {
  const { notifications, markAllAsRead, filterByType } = useNotifications()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'delivery', label: 'Livraisons' },
    { key: 'message', label: 'Messages' },
  ]

  const filtered = activeTab === 'all' ? notifications : filterByType(activeTab)

  return (
    <div className="font-display bg-background-light min-h-screen pb-24">
      <PageHeader
        title="Notifications"
        showBack
        rightAction={
          <button
            onClick={markAllAsRead}
            className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors text-primary"
          >
            <Icon name="done_all" />
          </button>
        }
      />

      <main className="max-w-lg mx-auto w-full">
        {/* Tabs */}
        <div className="flex border-b border-primary/10 px-4 sticky top-[73px] bg-background-light/80 backdrop-blur-md z-[5]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 pb-3 pt-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="divide-y divide-primary/5">
          {filtered.map((notif) => {
            const config = notifIconConfig[notif.type]
            return (
              <div
                key={notif.id}
                className={`flex gap-4 px-4 py-4 items-start relative ${
                  !notif.read ? 'bg-white' : 'bg-transparent opacity-75'
                }`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                <div
                  className={`flex items-center justify-center rounded-xl shrink-0 size-12 ${config.bg} ${config.text} ${
                    notif.type === 'delivery' ? 'shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  <Icon name={config.icon} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-base ${!notif.read ? 'font-bold' : 'font-semibold'} text-slate-900`}>
                      {notif.title}
                    </p>
                    <span className={`text-xs shrink-0 ml-2 ${!notif.read ? 'text-primary font-semibold uppercase tracking-wider' : 'text-slate-400'}`}>
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{notif.body}</p>
                  {notif.actions && (
                    <div className="mt-3 flex gap-2">
                      {notif.actions.map((action, i) => (
                        <button
                          key={i}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                            action.variant === 'primary'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        <div className="p-8 text-center">
          <p className="text-slate-400 text-sm">Vous avez vu toutes les notifications récentes</p>
        </div>
      </main>
    </div>
  )
}
```

**Step 3: Create PlaceholderPage**

Create `src/pages/PlaceholderPage.tsx`:

```tsx
import { Icon } from '../components/Icon'

interface PlaceholderPageProps {
  title: string
  icon: string
}

export function PlaceholderPage({ title, icon }: PlaceholderPageProps) {
  return (
    <div className="font-display bg-background-light min-h-screen pb-24 flex items-center justify-center">
      <div className="text-center px-8">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon name={icon} className="text-primary" size="xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">Cette fonctionnalité sera disponible prochainement.</p>
      </div>
    </div>
  )
}
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/pages/HistoryPage.tsx src/pages/NotificationsPage.tsx src/pages/PlaceholderPage.tsx
git commit -m "Add history, notifications, and placeholder pages"
```

---

### Task 10: App routing, auth guard, and final wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Wire up App.tsx with complete routing**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TourListPage } from './pages/TourListPage'
import { MapPage } from './pages/MapPage'
import { DeliveryDetailsPage } from './pages/DeliveryDetailsPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ReportIssuePage } from './pages/ReportIssuePage'
import { HistoryPage } from './pages/HistoryPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function AuthGuard() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function AppLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tournee" element={<TourListPage />} />
            <Route path="/historique" element={<HistoryPage />} />
            <Route path="/revenus" element={<PlaceholderPage title="Revenus" icon="account_balance_wallet" />} />
            <Route path="/profil" element={<PlaceholderPage title="Profil" icon="person" />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          {/* Pages without bottom nav */}
          <Route path="/tournee/carte" element={<MapPage />} />
          <Route path="/livraison/:id" element={<DeliveryDetailsPage />} />
          <Route path="/livraison/:id/confirmation" element={<ConfirmationPage />} />
          <Route path="/livraison/:id/signalement" element={<ReportIssuePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**Step 2: Clean up main.tsx**

Ensure `src/main.tsx` is:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 3: Remove default Vite boilerplate files**

```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```

**Step 4: Verify full app works**

```bash
npm run build
# Should succeed with 0 errors

npm run dev
# Visit http://localhost:5173
# Should redirect to /login
# Enter any phone + PIN, click "Se connecter"
# Should navigate to dashboard with stats, delivery list
# Click "Démarrer la tournée" → see tour list
# Click a delivery → see details
# Click "Confirmer la livraison" → confirmation page
# Bottom tabs should work: Missions, Revenus (placeholder), Profil (placeholder), Notifications
# Ctrl+C to stop
```

**Step 5: Commit**

```bash
git add -A
git commit -m "Wire up routing, auth guard, and complete app navigation"
```

---

### Task 11: Initialize Capacitor for mobile

**Files:**
- Create: `capacitor.config.ts`

**Step 1: Install Capacitor**

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Profood Livreur" "com.profoodapp.livreur" --web-dir dist
```

**Step 2: Verify capacitor.config.ts**

The generated file should look like:

```typescript
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.profoodapp.livreur',
  appName: 'Profood Livreur',
  webDir: 'dist',
}

export default config
```

**Step 3: Build and verify**

```bash
npm run build
# dist/ folder should be generated
```

**Step 4: Commit**

```bash
git add capacitor.config.ts package.json package-lock.json
git commit -m "Initialize Capacitor for mobile deployment"
```

---

### Task 12: Final verification and cleanup

**Step 1: Full build check**

```bash
npm run build
# Must succeed with 0 TypeScript errors
```

**Step 2: Verify all routes manually**

Start dev server and navigate to each route:
- `/login` → Login page
- `/` → Dashboard (after login)
- `/tournee` → Tour list
- `/tournee/carte` → Map placeholder
- `/livraison/del-001` → Delivery details
- `/livraison/del-001/confirmation` → Confirmation
- `/livraison/del-001/signalement` → Report issue
- `/historique` → History
- `/notifications` → Notifications
- `/revenus` → Placeholder
- `/profil` → Placeholder

**Step 3: Check for console errors**

Open browser DevTools, navigate through all pages, ensure no console errors.

**Step 4: Final commit if any cleanup needed**

```bash
git status
# If clean: done
# If changes: git add -A && git commit -m "Final cleanup"
```

**Step 5: Verify git log**

```bash
git log --oneline
# Should show ~10 clean commits
```
