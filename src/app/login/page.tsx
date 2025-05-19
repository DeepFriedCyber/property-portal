'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignIn } from '@clerk/nextjs'

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Clerk's SignIn component handles the entire authentication flow */}
        <SignIn 
          path="/login"
          routing="path"
          signUpUrl="/register"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
