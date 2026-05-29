import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthNavProps = {
  variant?: "login" | "register";
};

export function AuthNav({ variant = "login" }: AuthNavProps) {
  const isRegister = variant === "register";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between",
        isRegister ? "h-14 px-4 md:h-16 md:px-12" : "h-14 px-4 md:h-16 md:px-12"
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-landing-soft md:h-7 md:w-7">
          <ShoppingBag className="h-3.5 w-3.5 text-landing-brand md:h-4 md:w-4" />
        </span>
        <span className="text-[15px] font-bold text-landing-text md:text-[17px]">
          IntentCommerce
        </span>
      </Link>

      {isRegister ? (
        <>
          <div className="hidden items-center gap-4 md:flex">
            <span className="text-sm text-landing-secondary">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="rounded-lg border border-landing-border bg-white px-4 py-2 text-sm font-semibold text-landing-brand hover:bg-landing-page"
            >
              Sign in
            </Link>
          </div>
          <Link
            href="/login"
            className="text-[13px] font-semibold text-landing-brand md:hidden"
          >
            Sign in
          </Link>
        </>
      ) : (
        <nav className="flex items-center gap-6" aria-label="Auth">
          <Link
            href="/chat"
            className="hidden text-sm text-landing-secondary hover:text-landing-text sm:inline"
          >
            Browse products
          </Link>
          <Link
            href="/vendor"
            className="text-sm font-medium text-landing-brand hover:text-landing-brand-hover"
          >
            Vendor login
          </Link>
        </nav>
      )}
    </header>
  );
}
