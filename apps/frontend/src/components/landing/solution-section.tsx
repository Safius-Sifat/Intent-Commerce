import Link from "next/link";
import { CheckItem, PrimaryButton, SectionContainer, SectionHeading } from "./ui";

const SHOPPER_FEATURES = [
  "Natural language product discovery",
  "Product recommendations with reasons",
  "Product cards inside conversation",
  "Cart and checkout connected to the same flow",
] as const;

const VENDOR_FEATURES = [
  "Product and inventory management",
  "Vendor order dashboard",
  "Natural language analytics",
  "Demand forecasting and stock alerts",
] as const;

const BAR_HEIGHTS = [20, 32, 28, 40, 36, 48];

export function SolutionSection() {
  return (
    <section id="vendors" className="bg-landing-soft">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <SectionHeading centered className="mx-auto max-w-[900px] text-center">
          One platform for intent-based shopping and smarter selling.
        </SectionHeading>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2">
          <article className="flex flex-col gap-5 rounded-2xl border border-landing-border bg-white p-6 md:p-8">
            <h3 className="text-xl font-bold text-landing-text md:text-2xl">
              Describe. Compare. Checkout.
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SHOPPER_FEATURES.map((f) => (
                <CheckItem key={f}>{f}</CheckItem>
              ))}
            </ul>
            <div className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-landing-page p-3">
              <div className="flex flex-col gap-1.5 rounded-lg border border-landing-border bg-white p-2.5">
                <div className="h-12 rounded-md bg-landing-border" />
                <span className="text-[11px] font-semibold text-landing-text">
                  Trail Backpack
                </span>
              </div>
              <div className="flex w-[100px] flex-col justify-center rounded-lg bg-landing-soft p-2.5">
                <span className="text-[11px] font-semibold text-landing-text">
                  Cart · 2
                </span>
              </div>
            </div>
            <PrimaryButton href="/chat" className="self-start px-[18px] py-2.5 text-sm">
              Try shopping flow
            </PrimaryButton>
          </article>

          <article className="flex flex-col gap-5 rounded-2xl border border-landing-border bg-white p-6 md:p-8">
            <h3 className="text-xl font-bold text-landing-text md:text-2xl">
              Manage. Understand. Forecast.
            </h3>
            <ul className="flex flex-col gap-2.5">
              {VENDOR_FEATURES.map((f) => (
                <CheckItem key={f}>{f}</CheckItem>
              ))}
            </ul>
            <div className="flex flex-col gap-2 rounded-xl bg-landing-page p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white p-2">
                  <p className="text-[10px] text-landing-secondary">Revenue</p>
                  <p className="text-sm font-bold text-landing-text">$2.4k</p>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <p className="text-[10px] text-landing-secondary">Orders</p>
                  <p className="text-sm font-bold text-landing-text">18</p>
                </div>
              </div>
              <div className="flex h-12 items-end gap-1">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-landing-brand opacity-70"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
            <Link
              href="/vendor"
              className="inline-flex self-start rounded-[10px] bg-landing-brand px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-landing-brand-hover"
            >
              View vendor tools
            </Link>
          </article>
        </div>
      </SectionContainer>
    </section>
  );
}
