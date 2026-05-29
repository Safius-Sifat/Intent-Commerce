"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthNav } from "./auth-nav";
import { CommercePreview } from "./commerce-preview";
import { LoginForm, type LoginFieldErrors } from "./login-form";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!email.trim() || !EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  }
  if (errors.email || errors.password) {
    errors.general =
      "We couldn't sign you in. Check your email and password, then try again.";
  }
  return errors;
}

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.morgan@email.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null
  );
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(email, password);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("remember_email", email);
      }
      router.push("/chat");
    } catch {
      setErrors({
        general:
          "We couldn't sign you in. Check your email and password, then try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-landing-page">
      <AuthNav />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-8 pt-2 md:px-12 md:pb-14 md:pt-6 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-center lg:max-w-[520px] lg:shrink-0 lg:items-stretch">
          <LoginForm
            email={email}
            password={password}
            rememberMe={rememberMe}
            showPassword={showPassword}
            focusedField={focusedField}
            errors={errors}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRememberMeChange={setRememberMe}
            onTogglePassword={() => setShowPassword((v) => !v)}
            onFocusField={setFocusedField}
            onSubmit={handleSubmit}
          />

          <p className="mt-5 text-center text-[13px] text-landing-secondary lg:hidden">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-landing-brand">
              Create shopper account
            </Link>
          </p>
          <p className="mt-3 text-center text-[13px] text-landing-secondary lg:hidden">
            Are you a vendor?{" "}
            <Link href="/vendor" className="font-semibold text-landing-brand">
              Go to vendor login
            </Link>
          </p>

          <div className="mt-6 w-full lg:hidden">
            <CommercePreview compact />
          </div>

          <p className="mt-8 hidden text-center text-sm text-landing-secondary lg:block">
            Are you a vendor?{" "}
            <Link
              href="/vendor"
              className="font-semibold text-landing-brand hover:underline"
            >
              Go to vendor login
            </Link>
          </p>
        </div>

        <div className="hidden min-h-[min(640px,70vh)] flex-1 lg:block">
          <CommercePreview />
        </div>
      </div>
    </div>
  );
}
