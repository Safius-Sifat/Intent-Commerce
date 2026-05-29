import { Search } from "lucide-react";
import { PrimaryButton, SecondaryButton, SectionContainer, TrustDot } from "./ui";

const HERO_PRODUCTS = [
  {
    name: "Brooks Ghost 15",
    vendor: "Summit Outdoors",
    stock: "In stock",
    price: "$89.99",
    bestMatch: true,
  },
  {
    name: "Saucony Ride 17",
    vendor: "Fleet Footwear",
    stock: "12 left",
    price: "$94.00",
    bestMatch: false,
  },
  {
    name: "ASICS Novablast",
    vendor: "Trail Hub",
    stock: "Low stock",
    price: "$118.00",
    bestMatch: false,
  },
] as const;

function HeroMockup({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-[14px] border border-landing-border bg-white p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.07)] md:rounded-[20px] md:p-6">
      <div className="flex items-center gap-2.5 rounded-xl bg-landing-soft px-3 py-2.5 md:gap-2.5 md:px-4 md:py-3.5">
        <Search className="h-[18px] w-[18px] shrink-0 text-landing-brand" />
        <p className="text-xs text-landing-text md:text-sm">
          {compact
            ? "Running shoes under $120"
            : "I need comfortable running shoes under $120"}
        </p>
      </div>

      <div className="relative mt-3 md:mt-4">
        <div className="flex flex-col gap-2.5 md:gap-2.5">
          {HERO_PRODUCTS.slice(0, compact ? 1 : 3).map((product) => (
            <div
              key={product.name}
              className="flex items-center gap-2 rounded-xl border border-landing-border bg-landing-page p-2 md:gap-3 md:p-2.5"
            >
              <div className="h-11 w-11 shrink-0 rounded-lg bg-landing-border md:h-14 md:w-14" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-landing-text md:text-[13px]">
                    {compact
                      ? `${product.name} · ${product.price} · Best match`
                      : product.name}
                  </span>
                  {product.bestMatch && !compact && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      Best match
                    </span>
                  )}
                </div>
                {!compact && (
                  <>
                    <p className="text-[11px] text-landing-secondary">
                      {product.vendor} · {product.stock}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-landing-text">
                        {product.price}
                      </span>
                      <span className="rounded-lg bg-landing-brand px-2.5 py-1.5 text-[11px] font-semibold text-white">
                        Add
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {!compact && (
          <div className="absolute -right-2 top-4 hidden w-[200px] flex-col gap-3 rounded-[14px] bg-landing-soft p-4 lg:flex">
            <p className="text-[13px] font-semibold text-landing-text">2 items</p>
            <p className="text-[11px] text-landing-secondary">Estimated total</p>
            <p className="text-[22px] font-bold text-landing-brand">$183.99</p>
            <span className="inline-flex justify-center rounded-lg bg-landing-brand px-3 py-2 text-xs font-semibold text-white">
              Checkout ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="bg-landing-page">
      <SectionContainer className="py-6 md:py-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex flex-1 flex-col gap-5 lg:max-w-[560px] lg:gap-6">
            <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight text-landing-text lg:text-[64px] lg:leading-[1.05]">
              Find what you mean, not just what you type.
            </h1>
            <p className="max-w-[500px] text-base leading-relaxed text-landing-secondary lg:text-lg lg:leading-[1.55]">
              <span className="lg:hidden">
                Describe what you need. Discover products faster. Vendors forecast
                demand before stock runs out.
              </span>
              <span className="hidden lg:inline">
                IntentCommerce helps shoppers describe what they need and discover
                the right products faster, while vendors manage products, orders,
                analytics, and demand forecasting from one intelligent dashboard.
              </span>
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href="/chat" className="w-full sm:w-auto lg:px-6">
                Start Shopping
              </PrimaryButton>
              <SecondaryButton href="/vendor" className="w-full sm:w-auto lg:px-6">
                Explore Vendor Dashboard
              </SecondaryButton>
            </div>

            <div className="hidden flex-wrap gap-5 lg:flex">
              <TrustDot label="Product discovery" />
              <TrustDot label="Secure checkout" />
              <TrustDot label="Vendor analytics" />
              <TrustDot label="Demand forecasting" />
            </div>
          </div>

          <div className="flex-1 lg:max-w-[580px]">
            <div className="lg:hidden">
              <HeroMockup compact />
            </div>
            <div className="hidden lg:block">
              <HeroMockup />
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
