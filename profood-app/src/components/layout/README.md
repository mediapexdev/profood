# Desktop Navigation Component

## Overview

The `DesktopNav` component provides a horizontal navigation header for the Profood app on desktop screens (≥992px). It includes branding, main navigation links, a search bar, and a shopping cart icon with item count.

## Features

- **Responsive Design**: Only displays on desktop screens (≥992px width)
- **Theme Support**: Automatically adapts to dark/light mode
- **Active Link Highlighting**: Visual indicator for current page
- **Cart Item Counter**: Badge showing total items in cart
- **i18n Support**: All text is translatable (French/English)
- **Accessibility**: Keyboard navigation and focus states

## Installation

### 1. Import the Component

Add the `DesktopNav` component to your main app layout. Recommended placement: directly inside `IonApp` before the router content.

```tsx
import DesktopNav from './components/layout/DesktopNav';

const App: React.FC = () => {
    return (
        <IonApp>
            {/* Desktop Navigation - only visible on ≥992px screens */}
            <DesktopNav />

            {/* Rest of your app router */}
            <IonReactRouter>
                {/* ... */}
            </IonReactRouter>
        </IonApp>
    );
};
```

### 2. Adjust Content Padding

Since the DesktopNav is fixed at the top, you may need to add top padding to your content on desktop to prevent overlap:

```css
/* In your responsive.css or global styles */
@media (min-width: 992px) {
    .ion-page {
        padding-top: 64px; /* Height of DesktopNav */
    }
}
```

## Component Structure

```
DesktopNav
├── Logo (left)
│   └── 🥩 PROFOOD
├── Navigation Links (center)
│   ├── Accueil (Home)
│   ├── Nos Boxes (Our Boxes)
│   ├── Catégories (Categories)
│   └── Mon Compte (My Account)
├── Search Bar (middle-right)
│   └── Click to navigate to /search
└── Cart Icon (right)
    └── Badge with item count
```

## Navigation Links

The component includes these main navigation links:

| Label | Route | Exact Match |
|-------|-------|-------------|
| Accueil | `/` | Yes |
| Nos Boxes | `/box-types/` | No (prefix) |
| Catégories | `/categories/` | No (prefix) |
| Mon Compte | `/views/account` | No (prefix) |

**Active Link Detection:**
- Home (`/`) requires exact path match
- Other links use prefix matching (e.g., `/box-types/123` highlights "Nos Boxes")

## Cart Integration

The cart icon displays a badge with the total number of items (boxes + slices) from the `CartContext`:

```tsx
const cartItemCount = boxes.length + slices.length;
```

Clicking the cart icon navigates to `/cart/`.

## Search Functionality

The search bar is **readonly** and acts as a navigation trigger:
- Clicking it redirects to `/search`
- Placeholder text: "Rechercher un produit..." (Search for a product...)

## Theme Support

The component automatically adapts to the current theme mode from `ThemeModeContext`:

**Light Mode:**
- Background: `#ffffff`
- Text: `#2C3E50`
- Subtle box shadow

**Dark Mode:**
- Background: `#1a1a1a`
- Text: `#ECF0F1`
- Enhanced box shadow

**Primary Accent Color:**
- Hover states: `#E74C3C` (Profood red)
- Active link: `#E74C3C`
- Cart badge: `danger` color (red)

## Customization

### Changing Navigation Links

Edit the `navLinks` array in `DesktopNav.tsx`:

```tsx
const navLinks = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/box-types/', label: 'Nos Boxes', exact: false },
    // Add more links here
];
```

### Styling Modifications

All styles are in `DesktopNav.css`. Key CSS classes:

- `.desktop-nav` - Main container
- `.desktop-nav--light` / `.desktop-nav--dark` - Theme variants
- `.desktop-nav__logo` - Logo section
- `.desktop-nav__links` - Navigation links container
- `.desktop-nav__link--active` - Active link state
- `.desktop-nav__search` - Search bar section
- `.desktop-nav__cart` - Cart icon section

### Responsive Breakpoints

```css
/* Hide on mobile/tablet */
@media (max-width: 991px) {
    .desktop-nav { display: none; }
}

/* Adjust spacing on smaller desktops */
@media (min-width: 992px) and (max-width: 1200px) {
    /* Compact layout */
}

/* Optimize for large screens */
@media (min-width: 1600px) {
    /* Expanded layout */
}
```

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Clear outline on focused elements
- **Color Contrast**: WCAG AA compliant in both themes
- **Semantic HTML**: Proper use of `<header>` and `<nav>` elements

## Dependencies

The component requires these contexts to be available:

1. **CartContext** (`CartProvider`) - For cart item count
2. **ThemeModeContext** (`ThemeModeProvider`) - For dark/light theme
3. **i18next** - For internationalization

Make sure these providers wrap your app in `index.tsx` or `App.tsx`.

## Translation Keys

Add these keys to your translation files if not present:

**French (`fr.json`):**
```json
{
    "Accueil": "Accueil",
    "Nos Boxes": "Nos Boxes",
    "Catégories": "Catégories",
    "Mon Compte": "Mon Compte",
    "Rechercher un produit...": "Rechercher un produit..."
}
```

**English (`en.json`):**
```json
{
    "Accueil": "Home",
    "Nos Boxes": "Our Boxes",
    "Catégories": "Categories",
    "Mon Compte": "My Account",
    "Rechercher un produit...": "Search for a product..."
}
```

## Browser Support

Works on all modern browsers that support:
- CSS Flexbox
- CSS Variables
- ES6+ JavaScript

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- **Memoization**: Cart item count is memoized with `useMemo`
- **Hardware Acceleration**: Transform animations use GPU acceleration
- **Minimal Re-renders**: Only updates when cart or theme changes
- **Efficient Context Usage**: Selective context subscriptions

## Future Enhancements

Potential improvements for future versions:

- [ ] User profile dropdown in account section
- [ ] Notifications badge
- [ ] Language switcher in header
- [ ] Mega menu for categories
- [ ] Sticky/hide on scroll behavior
- [ ] Search autocomplete in header

## Troubleshooting

### Component Not Showing

1. Check screen width is ≥992px
2. Verify `DesktopNav` is imported and rendered
3. Check z-index conflicts with other fixed elements

### Cart Count Not Updating

1. Ensure `CartProvider` wraps the app
2. Verify cart context exports `boxes` and `slices`
3. Check for context provider order issues

### Theme Not Switching

1. Confirm `ThemeModeProvider` is active
2. Verify `themeMode` value is 'dark' or 'light'
3. Check localStorage for theme persistence

### Translation Keys Missing

1. Add keys to both `en.json` and `fr.json`
2. Restart dev server to reload translations
3. Clear browser cache if needed

## File Locations

```
profood-app/
└── src/
    └── components/
        └── layout/
            ├── DesktopNav.tsx      # Component logic
            ├── DesktopNav.css      # Component styles
            └── README.md           # This file
```

## Related Components

- `MainMenu` - Sidebar navigation (mobile/tablet)
- `TabsMenu` - Bottom tabs (mobile)
- `SearchPage` - Full search experience

## License

Part of the Profood app project. Internal use only.
