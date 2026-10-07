import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

export type SavedAddress = typeof addresses.$inferSelect;

/** The user's saved addresses, default first. Always scoped to a user id taken from the session. */
export async function getAddressesForUser(userId: string): Promise<SavedAddress[]> {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt), asc(addresses.id));
}
