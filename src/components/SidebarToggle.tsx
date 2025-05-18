'use client'

import { useUIStore } from '@/store/useStore'

/**
 * Component for toggling the sidebar
 * Uses the global store for state management
 */
export default function SidebarToggle() {
  const { isSidebarOpen, toggleSidebar } = useUIStore()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      aria-expanded={isSidebarOpen}
      aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-controls="main-sidebar"
    >
      <span className="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>

      {/* Icon changes based on sidebar state */}
      {isSidebarOpen ? (
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  )
}
