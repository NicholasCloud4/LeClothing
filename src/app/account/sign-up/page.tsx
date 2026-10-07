import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage({ searchParams }: PageProps<"/account/sign-up">) {
  return (
    <AuthPage
      mode="sign-up"
      title="Create an account"
      intro="Track your orders, save addresses and check out faster."
      searchParams={searchParams}
    />
  );
}
