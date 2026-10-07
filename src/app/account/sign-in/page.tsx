import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  return (
    <AuthPage
      mode="sign-in"
      title="Sign in"
      intro="Welcome back. Sign in to see your orders and saved addresses."
      searchParams={searchParams}
    />
  );
}
