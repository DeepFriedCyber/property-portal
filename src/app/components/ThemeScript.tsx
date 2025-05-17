'use client';

// This component injects a script into the head to prevent flickering on page load
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Check for saved theme preference or use the system preference
            const theme = localStorage.getItem('theme') || 'system';
            
            // If the theme is 'system', check the system preference
            if (theme === 'system') {
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.classList.toggle('dark', systemTheme === 'dark');
            } else {
              // Otherwise, use the saved theme
              document.documentElement.classList.toggle('dark', theme === 'dark');
            }
          })();
        `,
      }}
    />
  );
}