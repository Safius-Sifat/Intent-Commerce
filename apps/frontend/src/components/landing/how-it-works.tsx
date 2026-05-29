import { SectionContainer, SectionHeading } from "./ui";

const STEPS_DESKTOP = [
  {
    n: 1,
    title: "Tell the platform what you need",
    desc: "A shopper can search naturally, like asking a store assistant.",
  },
  {
    n: 2,
    title: "Get relevant product matches",
    desc: "The system returns product options with price, availability, and vendor context.",
  },
  {
    n: 3,
    title: "Add to cart and checkout",
    desc: "Cart and checkout stay connected across browsing and conversation.",
  },
  {
    n: 4,
    title: "Vendors learn from demand",
    desc: "Sellers see analytics, product trends, and forecasted demand.",
  },
] as const;

const STEPS_MOBILE = [
  "Tell what you need",
  "Get product matches",
  "Checkout",
  "Vendor insights",
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-landing-page">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <SectionHeading centered className="mb-6 md:mb-12">
          <span className="lg:hidden">How it works</span>
          <span className="hidden lg:inline">How IntentCommerce works</span>
        </SectionHeading>

        <ol className="flex flex-col gap-4 lg:hidden">
          {STEPS_MOBILE.map((title, i) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-brand text-[13px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-landing-text">{title}</span>
            </li>
          ))}
        </ol>

        <div className="hidden justify-between gap-6 lg:flex">
          {STEPS_DESKTOP.map((step) => (
            <div
              key={step.n}
              className="flex max-w-[300px] flex-col items-center gap-3.5 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-landing-brand text-base font-bold text-white">
                {step.n}
              </span>
              <h3 className="text-base font-semibold text-landing-text">{step.title}</h3>
              <p className="text-sm leading-relaxed text-landing-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
