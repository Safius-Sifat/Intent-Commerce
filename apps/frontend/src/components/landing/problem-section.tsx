import { BarChart3, Search, TrendingUp } from "lucide-react";
import { SectionContainer, SectionHeading } from "./ui";

const PROBLEMS = [
  {
    icon: Search,
    title: "Shoppers search too much",
    text: "People often know what they want, but not the exact product name, filter, or category.",
  },
  {
    icon: TrendingUp,
    title: "Vendors guess demand",
    text: "Sellers need better visibility into what customers want, what is selling, and what may run out soon.",
  },
  {
    icon: BarChart3,
    title: "Data is hard to act on",
    text: "Dashboards often show numbers, but not clear next steps.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="bg-landing-page">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <SectionHeading centered className="mx-auto max-w-[800px]">
          Online shopping has too much searching and not enough understanding.
        </SectionHeading>

        <div className="mt-8 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
          {PROBLEMS.map((item, index) => (
            <article
              key={item.title}
              className={`flex flex-col gap-2 rounded-xl border border-landing-border bg-white p-4 md:gap-3.5 md:rounded-[14px] md:p-7 ${
                index > 0 ? "hidden md:flex" : ""
              }`}
            >
              <item.icon className="h-5 w-5 text-landing-brand md:h-[22px] md:w-[22px]" />
              <h3 className="text-sm font-semibold text-landing-text md:text-lg">
                {item.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-landing-secondary md:text-[15px]">
                {index === 0
                  ? "People know what they want, not the exact filter or SKU."
                  : item.text}
              </p>
            </article>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
