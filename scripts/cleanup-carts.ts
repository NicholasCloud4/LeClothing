// Deletes guest carts that haven't been touched in 30 days. Signed-in users' carts are kept.
// Safe to re-run, and a good candidate for a scheduled job later.
//
//   npm run db:cleanup-carts

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Same precedence as Next.js: .env.local wins over .env.
config({ path: [".env.local", ".env"], quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env.");
}

async function main() {
  const sql = neon(databaseUrl!);
  // Cart items go with their cart (ON DELETE CASCADE).
  const deleted = await sql.query(
    "delete from carts where user_id is null and updated_at < now() - interval '30 days' returning id",
  );
  console.log(`Deleted ${deleted.length} stale guest cart${deleted.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
