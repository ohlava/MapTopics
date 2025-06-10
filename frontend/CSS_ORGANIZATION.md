# CSS Organization Guide

## Overview
This document explains the reorganized CSS structure for the MapTopics frontend application. All component-specific styles have been separated from the global App.css file to improve maintainability and modularity.

## File Structure

### Global Styles
- **`App.css`** - Contains only global variables, reset styles, layout utilities, and common animations
- **`index.css`** - Default Vite/React index styles (mostly unused in this project)

### Component-Specific Styles

#### Layout Components
- **`components/Layout/MobileNavigation.css`** - Mobile navigation bar styles
- **`components/Layout/DesktopNavigation.css`** - Desktop navigation bar styles

#### Feed Components  
- **`components/Feed/ExploreFeed.css`** - Feed container, loading states, error states
- **`components/Feed/ExploreCard.css`** - Individual card styles, fullscreen modal

#### View Components
- **`components/Search/SearchView.css`** - Search page layout and suggestion chips
- **`components/Settings/SettingsView.css`** - Settings page layout and form elements

#### Debug Components
- **`components/Debug/Debug.css`** - Development-only debug info and health check styles

## What's in App.css (Global)

### CSS Variables
```css
:root {
  /* Colors */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --text-primary: #333;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-md: 1rem;
  
  /* Border radius */
  --radius-sm: 0.5rem;
  --radius-xl: 2rem;
}
```

### Global Reset
- Universal box-sizing
- Margin/padding reset
- Base typography

### Layout Structure
- `.app` - Main app container
- `.main-content` - Content area with mobile/desktop variants

### Utility Classes
- `.glass-effect` - Glassmorphism effect
- `.card-shadow` - Standard card shadow
- `.gradient-text` - Gradient text effect

### Common Animations
- `@keyframes pulse` - Loading animation

### Responsive Breakpoints
- Mobile: `max-width: 768px`
- Small mobile: `max-width: 480px`

## Component CSS Structure

Each component CSS file follows this pattern:

```css
/* ComponentName Component Styles */

/* Main component styles */
.component-name { }

/* Sub-elements */
.component-element { }

/* State variations */
.component-name.active { }
.component-name:hover { }

/* Mobile responsive */
@media (max-width: 768px) { }
```

## Import Pattern

Each component imports its own CSS:

```jsx
import './ComponentName.css';
```

## Benefits of This Organization

1. **Modularity** - Each component has its own styles
2. **Maintainability** - Easy to find and modify component-specific styles
3. **No Conflicts** - Component styles are isolated
4. **Performance** - Only relevant styles are loaded
5. **Consistency** - Global variables ensure design consistency
6. **Responsive** - Mobile-first responsive design in each component

## CSS Variables Usage

All components use the global CSS variables defined in App.css:

- **Colors**: `var(--primary-gradient)`, `var(--text-primary)`, etc.
- **Spacing**: `var(--spacing-sm)`, `var(--spacing-lg)`, etc.
- **Borders**: `var(--radius-md)`, `var(--glass-border)`, etc.

This ensures consistent spacing, colors, and effects across all components while maintaining the flexibility to customize individual components.

## Responsive Design

Each component handles its own responsive behavior:

- Mobile navigation appears on screens ≤768px
- Desktop navigation appears on screens >768px
- Grid layouts adapt at 1024px breakpoint
- Component-specific mobile optimizations at 480px

## Development Notes

- All glassmorphism effects use consistent backdrop-filter values
- Hover states use consistent transform and transition values  
- Loading states use the shared pulse animation
- Error states use consistent color schemes
- Debug components only appear in development mode

This organization makes the codebase much more maintainable and allows for easier customization of individual components without affecting others.
