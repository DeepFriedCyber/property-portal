import { SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Sign Out</h1>
        <p className="mb-6 text-gray-600">Are you sure you want to sign out?</p>
        <SignOutButton>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
