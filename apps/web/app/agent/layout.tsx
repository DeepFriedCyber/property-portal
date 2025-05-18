'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to sign-in page if not signed in
      router.push('/sign-in?redirect=/agent/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Agent Portal</span>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <a
                  href="/agent/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Dashboard
                </a>
                <a
                  href="/agent/properties"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  My Properties
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="mr-4 text-sm">
                  {user.firstName || user.emailAddresses[0].emailAddress}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">{children}</main>
    </div>
  )
}
