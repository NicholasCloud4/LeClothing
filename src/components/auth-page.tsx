import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { getSession, safeNextPath } from "@/lib/auth-session";

type AuthPageProps = {
  mode: "sign-in" | "sign-up";
  title: string;
  intro: string;
  searchParams: Promise<{ next?: string | string[] }>;
};

/** Static shell with the form resolved inside Suspense, because it reads `searchParams` and the session. */
export function AuthPage(props: AuthPageProps) {
  return (
    <div className="shell-narrow section">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="heading-2">{props.title}</h1>
          <p className="text-muted-foreground">{props.intro}</p>
        </header>
        <Suspense fallback={<div aria-hidden="true" className="h-80 animate-pulse bg-muted" />}>
          <AuthFormLoader {...props} />
        </Suspense>
      </div>
    </div>
  );
}

async function AuthFormLoader({ mode, searchParams }: Pick<AuthPageProps, "mode" | "searchParams">) {
  const { next } = await searchParams;
  // `next` is only echoed back when it is a same-site path.
  const nextPath = typeof next === "string" ? safeNextPath(next, "") : "";

  if (await getSession()) redirect(nextPath || "/account");

  return <AuthForm mode={mode} next={nextPath || undefined} />;
}
