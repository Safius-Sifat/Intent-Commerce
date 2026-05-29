import Link from "next/link";
import { SectionContainer } from "./ui";

const FOOTER_COLUMNS = [
  {
    heading: "PRODUCT",
    links: ["Browse", "Chat Shopping", "Cart", "Orders"],
  },
  {
    heading: "VENDORS",
    links: ["Dashboard", "Products", "Analytics", "Forecasting"],
  },
  {
    heading: "TRUST",
    links: ["Security", "Privacy", "Support"],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-landing-footer text-white">
      <SectionContainer className="py-10 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-[280px]">
            <p className="text-lg font-bold">IntentCommerce</p>
            <p className="mt-3 text-[13px] leading-relaxed text-white/65">
              Conversational commerce for shoppers and intelligent tools for
              vendors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-wide text-white/40">
                  {col.heading}
                </p>
                {col.links.map((label) => (
                  <Link
                    key={label}
                    href="#"
                    className="text-sm text-white/80 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <p className="text-xs text-white/50">
            © 2026 IntentCommerce. All rights reserved.
          </p>
        </div>
      </SectionContainer>
    </footer>
  );
}
