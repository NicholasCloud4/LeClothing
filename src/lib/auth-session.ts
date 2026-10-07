import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** The signed-in session, or null. Reads request headers, so call it inside a `<Suspense>` boundary. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Only same-site relative paths are accepted as post-login destinations. */
export function safeNextPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;
}

/** Account pages and actions call this; the proxy redirect is only a convenience. */
export async function requireUser(returnTo?: string) {
  const session = await getSession();
  if (!session) {
    redirect(returnTo ? `/account/sign-in?next=${encodeURIComponent(returnTo)}` : "/account/sign-in");
  }
  return session.user;
}
