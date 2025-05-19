import { currentUser, auth, clerkClient } from '@clerk/nextjs/server'

import { prisma } from '@/lib/db'
export { auth }
/**
 * Get the current user with extended DB info
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: (clerkUser.publicMetadata?.role as string) || 'user',
      },
    })
  }
  return {
    id: dbUser.id,
    clerkId: clerkUser.id,
    email: dbUser.email,
    role: dbUser.role,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  }
}
/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: string) {
  const user = await getCurrentUser()
  return user?.role === role
}
/**
 * Get any user by Clerk ID (includes DB data)
 */
export async function getUserByClerkId(clerkId: string) {
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(clerkId)
  const dbUser = await prisma.user.findUnique({ where: { clerkId } })

  if (!dbUser) {
    throw new Error(`User with clerkId ${clerkId} not found in database`)
  }

  return {
    id: dbUser.id,
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    role: dbUser.role ?? 'user',
  }
}
