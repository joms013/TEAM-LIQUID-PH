"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [isResetMode, setIsResetMode] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      isResetMode
        ? "Password reset is not connected yet. Please contact your administrator."
        : "Sign-in is not connected yet. Please contact your administrator.",
    );
  }

  function switchMode() {
    setIsResetMode((current) => !current);
    setNotice("");
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <section
        aria-label="Hope, Inc."
        className="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-[#284737] px-7 py-7 text-white sm:min-h-[330px] sm:px-10 sm:py-9 lg:min-h-screen lg:px-14 lg:py-12 xl:px-[clamp(3.5rem,8vw,8rem)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(18, 43, 32, .16) 0%, rgba(18, 43, 32, .1) 36%, rgba(18, 43, 32, .84) 100%), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1800&q=88')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[#1d392a]/15" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/35 backdrop-blur-sm">
            <HeartHandshake size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold">Hope, Inc.</span>
        </div>

        <div className="relative z-10 max-w-xl pb-2 sm:pb-4 lg:pb-8">
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase text-white/80">
            <span className="size-1.5 rounded-full bg-[#e6a37c]" />
            Better work. Brighter outcomes.
          </p>
          <h1 className="max-w-lg font-[Newsreader,Georgia,serif] text-4xl leading-[0.98] sm:text-5xl xl:text-7xl">
            Good things happen when we work together.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/80 sm:text-[15px]">
            One thoughtful place to support your team, your work, and the people
            who count on you.
          </p>
        </div>
        <p className="relative z-10 hidden text-xs text-white/65 lg:block">
          Hope, Inc. Team Workspace <span className="px-2">|</span> People first,
          always.
        </p>
      </section>

      <section className="flex min-h-[570px] items-center justify-center px-6 py-12 sm:px-12 lg:min-h-screen lg:px-10 xl:px-20">
        <div className="rise-in w-full max-w-[420px]">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#315b48]">
              <HeartHandshake size={19} aria-hidden="true" /> Hope, Inc.
            </span>
            <span className="text-xs text-[#748078]">Team Workspace</span>
          </div>

          <div className="rise-in-late">
            <div className="mb-8">
              <p className="mb-3 text-[11px] font-bold uppercase text-[#668171]">
                {isResetMode ? "Account recovery" : "Welcome to Hope"}
              </p>
              <h2 className="font-[Newsreader,Georgia,serif] text-[2.65rem] leading-none text-[#172a24] sm:text-5xl">
                {isResetMode ? "Reset your password" : "Good to have you back."}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#69766f]">
                {isResetMode
                  ? "Enter your work email and we'll help you get back into your account."
                  : "Sign in to your workspace and pick up where your team left off."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#26382f]">
                  Work email
                </span>
                <span className="relative block">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <input
                    autoComplete="email"
                    className="h-[52px] w-full rounded-[5px] border border-[#dce3dc] bg-white pl-11 pr-4 text-sm text-[#172a24] outline-none transition placeholder:text-[#a0aaa2] hover:border-[#a9b9ac] focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
                    name="email"
                    placeholder="you@hope.org"
                    required
                    type="email"
                  />
                </span>
              </label>

              {!isResetMode && (
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-[#26382f]">
                    Password
                  </span>
                  <span className="relative block">
                    <LockKeyhole
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <input
                      autoComplete="current-password"
                      className="h-[52px] w-full rounded-[5px] border border-[#dce3dc] bg-white pl-11 pr-12 text-sm text-[#172a24] outline-none transition placeholder:text-[#a0aaa2] hover:border-[#a9b9ac] focus:border-[#668171] focus:ring-2 focus:ring-[#668171]/15"
                      name="password"
                      placeholder="Enter your password"
                      required
                      type={isPasswordVisible ? "text" : "password"}
                    />
                    <button
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded text-[#748078] transition hover:bg-[#f1f4ef] hover:text-[#315b48] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#315b48]"
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                      type="button"
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={18} strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
                      )}
                    </button>
                  </span>
                </label>
              )}

              {!isResetMode && (
                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#59685f]">
                    <input
                      className="size-4 accent-[#315b48]"
                      name="remember"
                      type="checkbox"
                    />
                    Keep me signed in
                  </label>
                  <button
                    className="text-[13px] font-semibold text-[#315b48] underline decoration-[#b7c7ba] underline-offset-4 transition hover:text-[#234536] hover:decoration-[#315b48]"
                    onClick={switchMode}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {notice && (
                <p
                  aria-live="polite"
                  className="rounded-[5px] border border-[#ead7c9] bg-[#fff8f2] px-4 py-3 text-[13px] leading-5 text-[#775344]"
                >
                  {notice}
                </p>
              )}

              <button className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-[5px] bg-[#315b48] px-5 text-sm font-semibold text-white transition hover:bg-[#234536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b48]" type="submit">
                {isResetMode ? "Send reset instructions" : "Sign in to workspace"}
                <ArrowRight
                  className="transition-transform group-hover:translate-x-0.5"
                  size={17}
                  aria-hidden="true"
                />
              </button>

              {isResetMode && (
                <button
                  className="flex w-full items-center justify-center gap-2 py-1 text-[13px] font-semibold text-[#52645a] transition hover:text-[#234536]"
                  onClick={switchMode}
                  type="button"
                >
                  <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
                </button>
              )}
            </form>

            <div className="mt-9 flex items-start gap-3 border-t border-[#e6e9e3] pt-5">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#668171]"
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-[#78847c]">
                Your work stays private. This is a secure workspace for
                authorized Hope, Inc. team members.
              </p>
            </div>
          </div>

          <p className="mt-10 text-center text-[11px] text-[#929c94]">
            Copyright {new Date().getFullYear()} Hope, Inc. <span className="px-1.5">|</span>
            Need access? Contact your workspace administrator.
          </p>
        </div>
      </section>
    </main>
  );
}