'use client'

import Link from 'next/link'

import ThemeToggle from './ThemeToggle'

interface NavLink {
  href: string
  label: string
}

interface HeaderProps {
  navLinks?: NavLink[]
}

export default function Header({ navLinks = [] }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-dark-bg-secondary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                Property Portal
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <Link
              href="/login"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
