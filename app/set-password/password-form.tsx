"use client";

import { useActionState } from "react";
import {
  setFirstPasswordAction,
  setRecoveredPasswordAction,
} from "@/app/actions/auth";

export default function PasswordForm({
  isRecovery = false,
}: {
  isRecovery?: boolean;
}) {
  const action = isRecovery
    ? setRecoveredPasswordAction
    : setFirstPasswordAction;
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <label className="block text-sm font-semibold text-[#26382f]">
        New password
        <input
          autoComplete="new-password"
          className="mt-2 h-[52px] w-full rounded-[5px] border border-[#dce3dc] px-4 text-sm outline-none focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="block text-sm font-semibold text-[#26382f]">
        Confirm new password
        <input
          autoComplete="new-password"
          className="mt-2 h-[52px] w-full rounded-[5px] border border-[#dce3dc] px-4 text-sm outline-none focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      {state?.error && (
        <p aria-live="polite" className="rounded-[5px] border border-[#ead7c9] bg-[#fff8f2] px-4 py-3 text-[13px] text-[#775344]">
          {state.error}
        </p>
      )}
      <button
        className="h-[52px] w-full rounded-[5px] bg-[#315b48] px-5 text-sm font-semibold text-white hover:bg-[#234536] disabled:cursor-wait disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? "Saving password..."
          : isRecovery
            ? "Reset password"
            : "Set password and continue"}
      </button>
    </form>
  );
}