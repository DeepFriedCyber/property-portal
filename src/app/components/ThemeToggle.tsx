'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Determine if currently in dark mode
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  // Toggle between light, dark, and system
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          // Sun icon for light mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Optional: Advanced theme selector with system preference option */}
      <div className="relative">
        <button
          onClick={cycleTheme}
          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {theme === 'light' && 'Light'}
          {theme === 'dark' && 'Dark'}
          {theme === 'system' && 'System'}
        </button>
      </div>
    </div>
  )
}
