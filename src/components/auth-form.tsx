"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { signInAction, signUpAction, type AuthFormState } from "@/lib/actions/auth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  /** Where to go after success; carried through the sign-in/sign-up switch link. */
  next?: string;
};

const initialState: AuthFormState = {};

export function AuthForm({ mode, next }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, pending] = useActionState(isSignUp ? signUpAction : signInAction, initialState);
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}

      {isSignUp && (
        <FormField
          label="Full name"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          error={state.fieldErrors?.name}
        />
      )}
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        required
        hint={isSignUp ? "At least 8 characters." : undefined}
        error={state.fieldErrors?.password}
      />

      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={`/account/sign-in${query}`} className="link">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={`/account/sign-up${query}`} className="link">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
