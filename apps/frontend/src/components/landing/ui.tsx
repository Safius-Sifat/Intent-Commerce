import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-12", className)}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] bg-landing-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(36,91,79,0.13)] transition-colors hover:bg-landing-brand-hover md:text-base",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] border border-landing-border bg-white px-6 py-3.5 text-sm font-semibold text-landing-text transition-colors hover:bg-landing-page md:text-base",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function TrustDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-landing-secondary">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-landing-success" />
      {label}
    </span>
  );
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-landing-secondary">
      <Check className="h-4 w-4 shrink-0 text-landing-success" strokeWidth={2.5} />
      {children}
    </li>
  );
}

export function SectionHeading({
  children,
  className,
  centered,
}: {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <h2
      className={cn(
        "text-[22px] font-bold leading-tight text-landing-text md:text-[30px] lg:text-[40px]",
        centered && "text-center",
        className
      )}
    >
      {children}
    </h2>
  );
}
