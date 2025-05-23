import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const schema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("*"),
});

/**
 * Validate environment variables against the schema
 */
function validateEnv() {
  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fieldErrors } = error.flatten();
      const errorMessage = Object.entries(fieldErrors)
        .map(([key, errors]) => {
          if (errors && errors.length) {
            return `${key}: ${errors.join(", ")}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("\n");

      console.error("\n❌ Invalid environment variables:");
      console.error(errorMessage);
      console.error("\nFix the issues in your .env file.\n");
    } else {
      console.error("❌ An unknown error occurred during environment validation");
      console.error(error);
    }
    process.exit(1);
  }
}

// Skip validation in test environment
const shouldValidate = process.env.NODE_ENV !== "test" && !process.env.SKIP_ENV_VALIDATION;

export const env = shouldValidate ? validateEnv() : process.env;