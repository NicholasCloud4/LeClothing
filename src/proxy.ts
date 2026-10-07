import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic redirect only: it checks that a session cookie exists, not that it is valid.
// Every account page and action re-checks the session with `requireUser()`, and admin code with `requireAdmin()`.
// The role is not checked here: that would cost a DB query on every request.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = pathname === "/account/sign-in" || pathname === "/account/sign-up";

  if (!isAuthPage && !getSessionCookie(request)) {
    const signIn = new URL("/account/sign-in", request.url);
    signIn.searchParams.set("next", pathname + search);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
