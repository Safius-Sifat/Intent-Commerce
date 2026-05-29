"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "./ui";

const NAV_LINKS = [
  { label: "Browse", href: "#discovery" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "For Vendors", href: "#vendors" },
  { label: "Forecasting", href: "#vendor-preview" },
  { label: "Security", href: "#trust" },
] as const;

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-landing-border bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:h-[72px] md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-landing-soft">
            <ShoppingBag className="h-[18px] w-[18px] text-landing-brand" />
          </span>
          <span className="text-base font-bold text-landing-text md:text-lg">
            IntentCommerce
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-landing-secondary transition-colors hover:text-landing-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-landing-text hover:text-landing-brand"
          >
            Login
          </Link>
          <PrimaryButton href="/chat" className="px-5 py-2.5 text-[15px]">
            Start Shopping
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-landing-text lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-landing-border bg-white lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm text-landing-secondary hover:bg-landing-page hover:text-landing-text"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-landing-text"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <PrimaryButton href="/chat" className="mt-2 w-full">
            Start Shopping
          </PrimaryButton>
        </nav>
      </div>
    </header>
  );
}
