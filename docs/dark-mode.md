# Dark Mode Implementation Guide

This guide explains how dark mode has been implemented in the Property Portal application and how to use it in your components.

## Overview

The dark mode implementation uses Tailwind CSS's `dark` variant with the `class` strategy. This means dark mode is toggled by adding a `dark` class to the `html` element.

## Features

- **System preference detection**: Automatically follows the user's system preference
- **Manual toggle**: Users can override the system preference
- **Persistent preference**: User's choice is saved in localStorage
- **No flash on load**: Special script prevents flash of incorrect theme
- **Smooth transitions**: Color changes are animated for a better user experience

## How to Use Dark Mode in Your Components

### Basic Usage

Simply use Tailwind's `dark:` variant to specify dark mode styles:

```jsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  This content will have a white background with black text in light mode, and a dark gray
  background with white text in dark mode.
</div>
```

### Custom Colors

We've added custom color variables for dark mode in the Tailwind config:

```jsx
<div className="bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary">
  This uses our custom dark mode color palette.
</div>
```

Available custom colors:

- `dark-bg-primary`: Main background color
- `dark-bg-secondary`: Secondary background (cards, headers)
- `dark-bg-tertiary`: Tertiary background (inputs, highlights)
- `dark-text-primary`: Main text color
- `dark-text-secondary`: Secondary text (labels, captions)
- `dark-text-tertiary`: Tertiary text (placeholders, disabled)
- `dark-border-primary`: Main border color
- `dark-border-secondary`: Secondary border color
- `dark-accent-blue`: Blue accent color
- `dark-accent-green`: Green accent color
- `dark-accent-red`: Red accent color

### Theme Toggle Component

To add a theme toggle to your component:

```jsx
import ThemeToggle from '@/app/components/ThemeToggle'

export default function MyComponent() {
  return (
    <div>
      <ThemeToggle />
      {/* Your component content */}
    </div>
  )
}
```

### Accessing Theme in JavaScript

If you need to access or modify the theme in your component logic:

```jsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function MyComponent() {
  const { theme, setTheme } = useTheme()

  // Check if dark mode is active
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Change theme programmatically
  const enableDarkMode = () => setTheme('dark')
  const enableLightMode = () => setTheme('light')
  const useSystemPreference = () => setTheme('system')

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark mode: {isDarkMode ? 'Yes' : 'No'}</p>
      <button onClick={enableDarkMode}>Dark</button>
      <button onClick={enableLightMode}>Light</button>
      <button onClick={useSystemPreference}>System</button>
    </div>
  )
}
```

## Best Practices

1. **Always provide dark mode variants** for background colors, text colors, and borders
2. **Test both themes** to ensure good contrast and readability
3. **Use semantic color variables** instead of hardcoded color values
4. **Consider reduced motion preferences** for animations
5. **Ensure sufficient contrast** between text and background in both modes

## Example Components

Check out the theme demo page at `/theme-demo` to see examples of dark mode styling for various UI components.

## Troubleshooting

- If dark mode isn't working, check that the `dark` class is being added to the `html` element
- If there's a flash of incorrect theme on page load, ensure the `ThemeScript` component is included in the layout
- If components don't respond to theme changes, verify they're using the `dark:` variant correctly
