// Grants or removes the admin role. This is the only way to change a role: Better Auth's endpoints can't set it.
//
//   npm run auth:set-role -- <email> <customer|admin>

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { ROLES, isRole } from "../src/lib/roles";

// Same precedence as Next.js: .env.local wins over .env.
config({ path: [".env.local", ".env"], quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env.");
}

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !isRole(role)) {
    throw new Error(`Usage: npm run auth:set-role -- <email> <${ROLES.join("|")}>`);
  }

  const sql = neon(databaseUrl!);
  const updated = await sql.query(
    'update "user" set role = $1, updated_at = now() where email = lower($2) returning id',
    [role, email.trim()],
  );
  if (updated.length === 0) {
    throw new Error(`No user with email ${email}.`);
  }
  console.log(`${email} is now ${role}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
