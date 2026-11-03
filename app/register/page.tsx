"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();
      setMessage(result.message ?? result.error ?? "Something went wrong.");
      setIsSuccess(response.ok);
    } catch {
      setMessage("Could not reach the server. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6 py-12">
      <section className="w-full max-w-md">
        <p className="mb-3 text-xs font-bold uppercase text-[#668171]">
          Hope, Inc. Team Workspace
        </p>
        <h1 className="font-[Newsreader,Georgia,serif] text-4xl text-[#172a24]">
          Request an account
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#69766f]">
          Create your account. An administrator must approve it before you can
          access the workspace.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#26382f]">
              Full name
            </span>
            <input
              autoComplete="name"
              className="h-[50px] w-full rounded border border-[#dce3dc] bg-white px-4 text-sm outline-none focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
              name="fullName"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#26382f]">
              Work email
            </span>
            <input
              autoComplete="email"
              className="h-[50px] w-full rounded border border-[#dce3dc] bg-white px-4 text-sm outline-none focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#26382f]">
              Password
            </span>
            <input
              autoComplete="new-password"
              className="h-[50px] w-full rounded border border-[#dce3dc] bg-white px-4 text-sm outline-none focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
              minLength={8}
              name="password"
              required
              type="password"
            />
            <span className="mt-2 block text-xs text-[#78847c]">
              Use at least 8 characters.
            </span>
          </label>

          {message && (
            <p
              aria-live="polite"
              className={`rounded border px-4 py-3 text-sm ${
                isSuccess
                  ? "border-[#c9dfce] bg-[#f0f8f1] text-[#315b48]"
                  : "border-[#ead7c9] bg-[#fff8f2] text-[#775344]"
              }`}
            >
              {message}
            </p>
          )}

          <button
            className="h-[50px] w-full rounded bg-[#315b48] px-5 text-sm font-semibold text-white hover:bg-[#234536] disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Request account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#69766f]">
          Already have an account?{" "}
          <Link className="font-semibold text-[#315b48] underline" href="/">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}