"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthNav } from "./auth-nav";
import { RegisterForm, type RegisterBanner, type RegisterFieldErrors } from "./register-form";
import { ShopperBenefitsPanel } from "./shopper-benefits-panel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXISTING_EMAIL = "alex.morgan@email.com";

function validate(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  termsAccepted: boolean,
  requireTerms: boolean
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  }
  if (!email.trim() || !EMAIL_RE.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password must be at least 8 characters.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (requireTerms && !termsAccepted) {
    errors.terms = "Please accept the Terms and Privacy Policy.";
  }

  return errors;
}

export function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "fullName" | "email" | "password" | "confirmPassword" | null
  >(null);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [banner, setBanner] = useState<RegisterBanner>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const requireTerms =
      typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

    const nextErrors = validate(
      fullName,
      email,
      password,
      confirmPassword,
      termsAccepted,
      requireTerms
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (email.trim().toLowerCase() === EXISTING_EMAIL) {
      setErrors({});
      setBanner("existing-email");
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setIsLoading(false);
      setBanner("success");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push("/chat");
    } catch {
      setIsLoading(false);
      setErrors({
        fullName: "Full name is required.",
        email: "Please enter a valid email address.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-landing-page">
      <AuthNav variant="register" />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-8 pt-2 md:px-12 md:pb-12 md:pt-4 lg:flex-row lg:items-center lg:gap-14">
        <div className="flex w-full flex-col items-center lg:max-w-[560px] lg:shrink-0 lg:items-stretch">
          <RegisterForm
            fullName={fullName}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            termsAccepted={termsAccepted}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            focusedField={focusedField}
            errors={errors}
            banner={banner}
            isLoading={isLoading}
            onFullNameChange={setFullName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onTermsChange={setTermsAccepted}
            onTogglePassword={() => setShowPassword((v) => !v)}
            onToggleConfirmPassword={() => setShowConfirmPassword((v) => !v)}
            onFocusField={setFocusedField}
            onSubmit={handleSubmit}
          />

          <p className="mt-4 text-center text-[13px] text-landing-secondary lg:hidden">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-landing-brand">
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-center text-[13px] text-landing-secondary lg:hidden">
            Are you a vendor?{" "}
            <Link href="/vendor" className="font-semibold text-landing-brand">
              Create vendor account
            </Link>
          </p>

          <div className="mt-5 w-full lg:hidden">
            <ShopperBenefitsPanel compact />
          </div>

          <p className="mt-8 hidden text-center text-sm text-landing-secondary lg:block">
            Are you a vendor?{" "}
            <Link
              href="/vendor"
              className="font-semibold text-landing-brand hover:underline"
            >
              Create vendor account
            </Link>
          </p>
        </div>

        <div className="hidden min-h-[min(680px,75vh)] flex-1 lg:block">
          <ShopperBenefitsPanel />
        </div>
      </div>
    </div>
  );
}
