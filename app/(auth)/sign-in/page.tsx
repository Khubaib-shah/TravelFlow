"use client";

import { Eye, EyeOff, Plane } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--tf-bg)] p-4 text-[var(--tf-text-primary)]">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(var(--tf-text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="z-10 w-full max-w-[480px] rounded-2xl bg-[var(--tf-surface)] p-8 sm:p-10 shadow-[var(--shadow-xl)] border border-[var(--tf-border)]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tf-primary)] text-white shadow-md">
            <Plane className="h-7 w-7" />
          </div>
          <h1 className="tf-h2 mb-2 text-[var(--tf-text-primary)]">TravelFlow</h1>
          <p className="tf-body text-[var(--tf-text-secondary)]">The Operating System for Modern Travel Agencies</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="tf-caption font-semibold text-[var(--tf-text-primary)]" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@agency.com"
              className="w-full rounded-md border border-[var(--tf-border)] bg-[var(--tf-surface)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--tf-primary)] focus:ring-1 focus:ring-[var(--tf-primary)] placeholder:text-[var(--tf-text-muted)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="tf-caption font-semibold text-[var(--tf-text-primary)]" htmlFor="password">
                Password
              </label>
              <Link href="#" className="tf-caption text-[var(--tf-primary)] hover:text-[var(--tf-primary-hover)]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-md border border-[var(--tf-border)] bg-[var(--tf-surface)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--tf-primary)] focus:ring-1 focus:ring-[var(--tf-primary)] placeholder:text-[var(--tf-text-muted)] pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)]"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="h-4 w-4 rounded border-[var(--tf-border)] text-[var(--tf-primary)] focus:ring-[var(--tf-primary)]"
            />
            <label htmlFor="remember" className="tf-body-sm text-[var(--tf-text-secondary)]">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-[var(--tf-primary)] py-3 font-semibold text-white transition-colors hover:bg-[var(--tf-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-primary)] focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="tf-body-sm text-[var(--tf-text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-semibold text-[var(--tf-primary)] hover:text-[var(--tf-primary-hover)]">
              Contact your agency admin
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 text-center">
        <p className="tf-caption text-[var(--tf-text-muted)]">© 2026 TravelFlow · thekhubaib.me</p>
      </div>
    </div>
  );
}
