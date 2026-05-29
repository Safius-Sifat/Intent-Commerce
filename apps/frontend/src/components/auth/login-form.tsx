"use client";

import Link from "next/link";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LoginFieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

type LoginFormProps = {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  focusedField: "email" | "password" | null;
  errors: LoginFieldErrors;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onTogglePassword: () => void;
  onFocusField: (field: "email" | "password" | null) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function fieldBorder(
  hasError: boolean,
  isFocused: boolean
): string {
  if (hasError) return "border-red-500 ring-2 ring-red-500/20";
  if (isFocused) return "border-landing-brand ring-2 ring-landing-brand/20 shadow-[0_0_6px_rgba(36,91,79,0.2)]";
  return "border-landing-border";
}

export function LoginForm({
  email,
  password,
  rememberMe,
  showPassword,
  focusedField,
  errors,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onFocusField,
  onSubmit,
}: LoginFormProps) {
  const emailFocused = focusedField === "email";
  const passwordFocused = focusedField === "password";

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-[520px] flex-col gap-5 rounded-[20px] border border-landing-border bg-white p-7 shadow-[0_4px_16px_rgba(0,0,0,0.05)] lg:max-w-[420px] lg:gap-5 lg:rounded-3xl lg:p-10 lg:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-landing-brand">Shopper account</span>
        <h1 className="text-[28px] font-bold text-landing-text lg:text-[32px]">
          Welcome back
        </h1>
        <p className="text-[15px] leading-relaxed text-landing-secondary">
          Sign in to continue shopping, view your cart, and track your orders.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-medium text-landing-text">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onFocus={() => onFocusField("email")}
          onBlur={() => onFocusField(null)}
          disabled={isLoading}
          placeholder="you@email.com"
          className={cn(
            "h-12 w-full rounded-[10px] border bg-white px-3.5 text-sm outline-none transition-shadow placeholder:text-landing-secondary disabled:opacity-70 lg:placeholder:text-transparent",
            errors.email ? "text-red-600" : "text-landing-text",
            fieldBorder(!!errors.email, emailFocused)
          )}
        />
        {errors.email && (
          <p className="text-xs text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {errors.general && (
        <div
          className="flex gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-[13px] text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-landing-text">
          Password
        </label>
        <div
          className={cn(
            "flex h-12 items-center rounded-[10px] border bg-white px-3.5 transition-shadow",
            fieldBorder(!!errors.password, passwordFocused)
          )}
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={() => onFocusField("password")}
            onBlur={() => onFocusField(null)}
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent text-sm text-landing-text outline-none placeholder:text-landing-secondary disabled:opacity-70"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="ml-2 shrink-0 text-landing-secondary hover:text-landing-text"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="hidden cursor-pointer items-center gap-2 lg:flex">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            disabled={isLoading}
            className="h-[18px] w-[18px] rounded border-landing-brand text-landing-brand focus:ring-landing-brand"
          />
          <span className="text-[13px] text-landing-secondary">Remember me</span>
        </label>
        <span className="text-xs text-landing-secondary lg:hidden">Remember me</span>
        <Link
          href="#"
          className="text-[13px] font-medium text-landing-brand hover:text-landing-brand-hover"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] text-base font-semibold text-white transition-colors disabled:cursor-not-allowed",
          isLoading
            ? "bg-landing-brand-hover opacity-90"
            : "bg-landing-brand hover:bg-landing-brand-hover"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <div className="flex items-start gap-2 pt-1">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-landing-secondary" />
        <p className="text-xs leading-relaxed text-landing-secondary">
          Your shopping activity and order history stay protected.
        </p>
      </div>

      <p className="hidden text-center text-sm text-landing-secondary lg:block">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-landing-brand hover:underline">
          Create shopper account
        </Link>
      </p>
    </form>
  );
}
