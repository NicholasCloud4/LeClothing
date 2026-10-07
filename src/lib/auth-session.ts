import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";

/** The signed-in session, or null. Reads request headers, so call it inside a `<Suspense>` boundary. */
export async function getSession() {
  // Keeps the session query out of prerenders (including runtime prefetches), where Next would abort it mid-flight.
  await connection();
  return auth.api.getSession({ headers: await headers() });
}

/** Account pages and actions call this; the proxy redirect is only a convenience. */
export async function requireUser(returnTo?: string) {
  const session = await getSession();
  if (!session) {
    redirect(returnTo ? `/account/sign-in?next=${encodeURIComponent(returnTo)}` : "/account/sign-in");
  }
  return session.user;
}

/** Admin pages, queries and actions call this. Signed out goes to sign-in; signed in without the role gets a 404. */
export async function requireAdmin(returnTo?: string) {
  const user = await requireUser(returnTo);
  if (!isAdmin(user)) notFound();
  return user;
}
