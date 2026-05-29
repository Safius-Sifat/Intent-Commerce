import Link from "next/link";
import { SectionContainer } from "./ui";

export function FinalCtaSection() {
  return (
    <section className="bg-landing-brand">
      <SectionContainer className="flex flex-col items-center gap-4 py-8 text-center md:gap-6 md:py-16 lg:py-[72px]">
        <h2 className="max-w-[700px] text-[26px] font-bold leading-tight text-white md:text-[32px] lg:text-[40px]">
          Start with what your customer means.
        </h2>
        <p className="hidden max-w-[640px] text-base text-white/80 md:block md:text-[17px]">
          IntentCommerce brings product discovery, checkout, vendor analytics, and
          demand forecasting into one modern commerce experience.
        </p>

        <div className="mt-2 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link
            href="/chat"
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-white text-base font-semibold text-landing-brand transition-colors hover:bg-white/95 sm:w-auto sm:px-7"
          >
            Start Shopping
          </Link>
          <Link
            href="/vendor"
            className="hidden h-12 items-center justify-center rounded-[10px] border border-white/30 bg-white/10 px-7 text-base font-semibold text-white transition-colors hover:bg-white/15 sm:inline-flex"
          >
            Open Vendor Dashboard
          </Link>
        </div>
      </SectionContainer>
    </section>
  );
}
