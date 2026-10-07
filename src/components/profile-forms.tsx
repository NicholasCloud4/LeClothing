"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { changePassword, updateProfile, type ProfileState } from "@/lib/actions/account";

const initialState: ProfileState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} noValidate className="flex max-w-md flex-col gap-5">
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <FormField
        label="Full name"
        name="name"
        autoComplete="name"
        required
        defaultValue={name}
        error={state.fieldErrors?.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        readOnly
        hint="Contact us to change the email on your account."
      />
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.saved && (
          <p role="status" className="text-success">
            Saved
          </p>
        )}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} noValidate className="flex max-w-md flex-col gap-5">
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <FormField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.currentPassword}
      />
      <FormField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters. Other devices will be signed out."
        error={state.fieldErrors?.newPassword}
      />
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-secondary" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
