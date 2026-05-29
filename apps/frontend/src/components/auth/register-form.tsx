"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RegisterFieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export type RegisterBanner = "success" | "existing-email" | null;

type RegisterFormProps = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  focusedField: "fullName" | "email" | "password" | "confirmPassword" | null;
  errors: RegisterFieldErrors;
  banner: RegisterBanner;
  isLoading: boolean;
  onFullNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onTermsChange: (v: boolean) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onFocusField: (f: RegisterFormProps["focusedField"]) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function fieldBorder(hasError: boolean, isFocused: boolean): string {
  if (hasError) return "border-red-500 ring-2 ring-red-500/20";
  if (isFocused)
    return "border-landing-brand ring-2 ring-landing-brand/20 shadow-[0_0_6px_rgba(36,91,79,0.2)]";
  return "border-landing-border";
}

export function RegisterForm({
  fullName,
  email,
  password,
  confirmPassword,
  termsAccepted,
  showPassword,
  showConfirmPassword,
  focusedField,
  errors,
  banner,
  isLoading,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTermsChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onFocusField,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-[520px] flex-col gap-[18px] rounded-[20px] border border-landing-border bg-white p-7 shadow-[0_4px_16px_rgba(0,0,0,0.05)] lg:rounded-3xl lg:p-10 lg:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-landing-brand">Shopper account</span>
        <h1 className="text-[24px] font-bold leading-tight text-landing-text lg:text-[28px]">
          Create your shopper account
        </h1>
        <p className="text-[15px] leading-relaxed text-landing-secondary">
          Save your cart, track orders, and discover products faster.
        </p>
      </div>

      {banner === "success" && (
        <div
          className="flex gap-2.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-3"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-landing-success" />
          <p className="text-[13px] text-landing-success">
            Account created successfully. Taking you to shopping.
          </p>
        </div>
      )}

      {banner === "existing-email" && (
        <div
          className="flex gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-[13px] text-red-600">
            An account with this email already exists. Try signing in instead.
          </p>
        </div>
      )}

      <Field
        id="fullName"
        label="Full name"
        value={fullName}
        onChange={onFullNameChange}
        onFocus={() => onFocusField("fullName")}
        onBlur={() => onFocusField(null)}
        disabled={isLoading || banner === "success"}
        placeholder="Enter your full name"
        error={errors.fullName}
        focused={focusedField === "fullName"}
      />

      <Field
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={onEmailChange}
        onFocus={() => onFocusField("email")}
        onBlur={() => onFocusField(null)}
        disabled={isLoading || banner === "success"}
        placeholder="you@example.com"
        error={errors.email}
        focused={focusedField === "email"}
        hasError={!!(errors.email || banner === "existing-email")}
      />

      <PasswordField
        id="password"
        label="Password"
        value={password}
        show={showPassword}
        onToggle={onTogglePassword}
        onChange={onPasswordChange}
        onFocus={() => onFocusField("password")}
        onBlur={() => onFocusField(null)}
        disabled={isLoading || banner === "success"}
        placeholder="Create a password"
        error={errors.password}
        focused={focusedField === "password"}
        helper="Use at least 8 characters."
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        value={confirmPassword}
        show={showConfirmPassword}
        onToggle={onToggleConfirmPassword}
        onChange={onConfirmPasswordChange}
        onFocus={() => onFocusField("confirmPassword")}
        onBlur={() => onFocusField(null)}
        disabled={isLoading || banner === "success"}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
        focused={focusedField === "confirmPassword"}
      />

      <div className="hidden flex-col gap-1 lg:flex">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            disabled={isLoading || banner === "success"}
            className={cn(
              "mt-0.5 h-[18px] w-[18px] shrink-0 rounded border focus:ring-landing-brand",
              termsAccepted
                ? "border-landing-brand bg-landing-brand text-white"
                : "border-landing-border"
            )}
          />
          <span className="text-[13px] leading-relaxed text-landing-secondary">
            I agree to the{" "}
            <Link href="#" className="font-medium text-landing-brand hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="font-medium text-landing-brand hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-600" role="alert">
            {errors.terms}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || banner === "success"}
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
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      <p className="hidden text-center text-sm text-landing-secondary lg:block">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-landing-brand hover:underline">
          Sign in
        </Link>
      </p>

      <div className="hidden items-start gap-2 lg:flex">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-landing-secondary" />
        <p className="text-xs leading-relaxed text-landing-secondary">
          Your shopping activity and order history stay protected.
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  placeholder,
  error,
  focused,
  hasError,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  focused?: boolean;
  hasError?: boolean;
}) {
  const showError = hasError ?? !!error;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-landing-text">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-[10px] border bg-white px-3.5 text-sm outline-none transition-shadow disabled:opacity-70",
          showError ? "text-red-600" : "text-landing-text",
          fieldBorder(showError, !!focused)
        )}
      />
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
  onFocus,
  onBlur,
  disabled,
  placeholder,
  error,
  focused,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  focused?: boolean;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-landing-text">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-[10px] border bg-white px-3.5 transition-shadow",
          fieldBorder(!!error, !!focused)
        )}
      >
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-landing-text outline-none placeholder:text-landing-secondary disabled:opacity-70"
        />
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 shrink-0 text-landing-secondary hover:text-landing-text"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
      {helper && (
        <p className="text-xs text-landing-secondary">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
