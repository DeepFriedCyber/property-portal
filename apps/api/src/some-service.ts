// Assuming your Drizzle schema is defined in apps/api/src/db/schema.ts
import { db, schema } from '@your-org/db' // Import both db client and schema
interface User {
  id: number
  fullName: string | null
  email?: string | null
  // add other fields as per your schema.users
}

export async function getAllUsers(): Promise<User[]> {
  // Schema is already bound to db, so you don't need to pass it again
  const users = await db.select().from(schema.users)
  return users
}

export async function createUser(fullName: string, email: string): Promise<User[]> {
  const newUser = await db.insert(schema.users).values({ fullName, email }).returning()
  return newUser
}

// Example usage (e.g., in an API route handler)
// async function handleUserRequest() {
//   try {
//     const users = await getAllUsers();
//     console.log(users);
//     const created = await createUser("John Doe", "john.doe@example.com");
//     console.log("Created user:", created);
//   } catch (error) {
//     console.error("Database operation failed:", error);
//   }
// }
