import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Email verification and password reset need a mail provider; add them with transactional email.
  },
  user: {
    additionalFields: {
      // Granted only by `scripts/set-role.ts`. `input: false` keeps it out of sign-up and update-user bodies.
      role: { type: "string", required: true, defaultValue: "customer", input: false },
    },
  },
  session: {
    // Better Auth's defaults, written out: a session lasts 7 days and is extended once a day while in use.
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // No cookieCache: every getSession reads the user row, so role changes and sign-outs apply immediately.
  },
  // Must stay last: lets Server Actions set the session cookie.
  plugins: [nextCookies()],
});
