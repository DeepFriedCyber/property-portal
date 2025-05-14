// ✅ Type-Safe Database Updates with Drizzle ORM

// Import the schema objects directly
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

// Example 1: Update a user with type safety
async function updateUserName(userId: string, newName: string) {
  // ✅ Good: Using the schema object for type safety
  await db.update(users)
    .set({ name: newName })
    .where(eq(users.id, userId));
}

// Example 2: Update multiple fields with type safety
async function updateUserProfile(userId: string, data: { 
  name?: string, 
  email?: string, 
  role?: string 
}) {
  // ✅ Good: Type-safe updates with proper filtering
  await db.update(users)
    .set(data)
    .where(eq(users.id, userId));
}

// Example 3: Conditional updates with type safety
async function promoteUserIfActive(userId: string) {
  // ✅ Good: Complex conditions with type safety
  await db.update(users)
    .set({ role: "admin" })
    .where(
      eq(users.id, userId),
      eq(users.isActive, true)
    );
}

// ❌ Bad: Using string literals (avoid this approach)
// async function updateUserUnsafe(userId: string, newName: string) {
//   await db.execute(
//     sql`UPDATE "users" SET name = ${newName} WHERE id = ${userId}`
//   );
// }

// ❌ Bad: Using raw SQL queries (avoid this approach)
// async function updateUserRoleUnsafe(userId: string) {
//   await db.execute(
//     `UPDATE users SET role = 'admin' WHERE id = '${userId}'`
//   );
// }

export { updateUserName, updateUserProfile, promoteUserIfActive };