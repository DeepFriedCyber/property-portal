import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '../../src/ui'

export interface NavLink {
  id: string
  label: string
  href: string
}

export interface HeaderProps {
  logoText?: string
  navLinks: NavLink[]
  isLoggedIn?: boolean
  onLogin?: () => void
  onSignup?: () => void
  onLogout?: () => void
  userName?: string
}

export const Header: React.FC<HeaderProps> = ({
  logoText = 'Property Portal',
  navLinks,
  isLoggedIn = false,
  onLogin,
  onSignup,
  onLogout,
  userName,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            {logoText}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.id}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">Hi, {userName}</span>
                <Button variant="secondary" onClick={onLogout} className="text-sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button variant="secondary" onClick={onLogin} className="text-sm">
                  Login
                </Button>
                <Button variant="primary" onClick={onSignup} className="text-sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4 mb-4">
              {navLinks.map(link => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons for Mobile */}
            <div className="flex flex-col space-y-2 pb-4">
              {isLoggedIn ? (
                <>
                  <div className="text-gray-700 mb-2">Hi, {userName}</div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onLogout?.()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onLogin?.()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onSignup?.()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
