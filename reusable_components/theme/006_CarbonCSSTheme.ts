/**
 * CarbonCSSTheme — Complete Carbon Design System CSS custom properties.
 * Drop-in for any Tailwind CSS project. Includes light + dark mode tokens,
 * base styles, focus states, transitions, scrollbar, link, and table styles.
 *
 * Extracted from: carbon-design-system-guide (globals.css)
 * - CSS custom properties for :root and .dark
 * - Carbon-specific focus rings (2px blue outline, 2px offset)
 * - Carbon transition timing (standard: 70ms, enter: 240ms, exit: 100ms)
 * - Custom scrollbar styling with dark mode support
 * - Typography base styles (600 weight headings, -0.01em tracking)
 * - Selection, link, and table base styles
 *
 * Usage: Import this file in your globals.css or tailwind base layer.
 */

export const carbonCSSTheme = `
/* ========== Carbon Design System — CSS Tokens ========== */

:root {
  /* Carbon Colors — Light Theme */
  --carbon-blue-60: #0f62fe;
  --carbon-blue-70: #0043ce;
  --carbon-gray-10: #f4f4f4;
  --carbon-gray-20: #e0e0e0;
  --carbon-gray-30: #c6c6c6;
  --carbon-gray-50: #8d8d8d;
  --carbon-gray-80: #393939;
  --carbon-gray-100: #161616;
  --carbon-green-60: #198038;
  --carbon-red-60: #da1e28;
  --carbon-yellow-30: #f1c21b;

  /* Radius */
  --radius: 0.125rem;

  /* Background & Foreground */
  --background: #ffffff;
  --foreground: var(--carbon-gray-100);
  --card: #ffffff;
  --card-foreground: var(--carbon-gray-100);
  --popover: #ffffff;
  --popover-foreground: var(--carbon-gray-100);

  /* Primary — Carbon Blue */
  --primary: var(--carbon-blue-60);
  --primary-foreground: #ffffff;

  /* Secondary */
  --secondary: var(--carbon-gray-10);
  --secondary-foreground: var(--carbon-gray-100);

  /* Muted */
  --muted: var(--carbon-gray-10);
  --muted-foreground: var(--carbon-gray-50);

  /* Accent */
  --accent: var(--carbon-gray-10);
  --accent-foreground: var(--carbon-gray-100);

  /* Destructive */
  --destructive: var(--carbon-red-60);

  /* Border & Input */
  --border: var(--carbon-gray-30);
  --input: var(--carbon-gray-30);
  --ring: var(--carbon-blue-60);

  /* Sidebar */
  --sidebar: var(--carbon-gray-10);
  --sidebar-foreground: var(--carbon-gray-100);
  --sidebar-primary: var(--carbon-blue-60);
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e5e5e5;
  --sidebar-accent-foreground: var(--carbon-gray-100);
  --sidebar-border: var(--carbon-gray-20);
  --sidebar-ring: var(--carbon-blue-60);
}

.dark {
  --background: var(--carbon-gray-100);
  --foreground: #f4f4f4;
  --card: #262626;
  --card-foreground: #f4f4f4;
  --popover: #262626;
  --popover-foreground: #f4f4f4;
  --primary: #4589ff;
  --primary-foreground: #ffffff;
  --secondary: #393939;
  --secondary-foreground: #f4f4f4;
  --muted: #393939;
  --muted-foreground: #a8a8a8;
  --accent: #393939;
  --accent-foreground: #f4f4f4;
  --destructive: #fa4d56;
  --border: #525252;
  --input: #525252;
  --ring: #4589ff;
  --sidebar: #1c1c1c;
  --sidebar-foreground: #f4f4f4;
  --sidebar-primary: #4589ff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #393939;
  --sidebar-accent-foreground: #f4f4f4;
  --sidebar-border: #393939;
  --sidebar-ring: #4589ff;
}

@layer base {
  * { border-color: var(--border); }
  body {
    background: var(--background);
    color: var(--foreground);
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Carbon transition timing */
* {
  transition-timing-function: cubic-bezier(0.2, 0, 0.38, 0.9);
}

/* Carbon focus rings — 2px blue outline, 2px offset */
*:focus-visible {
  outline: 2px solid var(--carbon-blue-60);
  outline-offset: 2px;
}

/* Carbon typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Carbon selection */
::selection {
  background: var(--carbon-blue-60);
  color: white;
}

/* Carbon link styles */
a {
  color: var(--carbon-blue-60);
  text-decoration: none;
  transition: color 70ms;
}
a:hover { text-decoration: underline; }
.dark a { color: #78a9ff; }

/* Carbon scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--carbon-gray-30); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--carbon-gray-50); }
.dark ::-webkit-scrollbar-thumb { background: #525252; }
.dark ::-webkit-scrollbar-thumb:hover { background: #6f6f6f; }

/* Carbon table styles */
table { border-collapse: collapse; width: 100%; }
th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
th { font-weight: 600; background: var(--muted); }
` as string

/**
 * Returns a JS object of the Carbon CSS custom properties.
 * Useful for programmatic access (e.g. in Tailwind config or Mantine theme).
 */
export function getCarbonCSSVars() {
  return {
    light: {
      background: '#ffffff',
      foreground: '#161616',
      card: '#ffffff',
      cardForeground: '#161616',
      primary: '#0f62fe',
      primaryForeground: '#ffffff',
      secondary: '#f4f4f4',
      secondaryForeground: '#161616',
      muted: '#f4f4f4',
      mutedForeground: '#8d8d8d',
      accent: '#f4f4f4',
      accentForeground: '#161616',
      destructive: '#da1e28',
      border: '#c6c6c6',
      input: '#c6c6c6',
      ring: '#0f62fe',
      sidebar: '#f4f4f4',
      sidebarForeground: '#161616',
      sidebarPrimary: '#0f62fe',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#e5e5e5',
      sidebarAccentForeground: '#161616',
      sidebarBorder: '#e0e0e0',
      sidebarRing: '#0f62fe',
    },
    dark: {
      background: '#161616',
      foreground: '#f4f4f4',
      card: '#262626',
      cardForeground: '#f4f4f4',
      primary: '#4589ff',
      primaryForeground: '#ffffff',
      secondary: '#393939',
      secondaryForeground: '#f4f4f4',
      muted: '#393939',
      mutedForeground: '#a8a8a8',
      accent: '#393939',
      accentForeground: '#f4f4f4',
      destructive: '#fa4d56',
      border: '#525252',
      input: '#525252',
      ring: '#4589ff',
      sidebar: '#1c1c1c',
      sidebarForeground: '#f4f4f4',
      sidebarPrimary: '#4589ff',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#393939',
      sidebarAccentForeground: '#f4f4f4',
      sidebarBorder: '#393939',
      sidebarRing: '#4589ff',
    },
  }
}
