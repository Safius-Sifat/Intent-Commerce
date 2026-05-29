import { FileText, Shield, ShoppingCart, Users } from "lucide-react";
import { SectionContainer, SectionHeading } from "./ui";

const TRUST_ITEMS = [
  {
    icon: Users,
    title: "Role-based access",
    text: "Shoppers and vendors have separate secure workflows.",
  },
  {
    icon: ShoppingCart,
    title: "Reliable cart and orders",
    text: "Cart, checkout, and orders are handled as persistent commerce records.",
  },
  {
    icon: Shield,
    title: "Vendor-scoped analytics",
    text: "Vendors only see their own business data.",
  },
  {
    icon: FileText,
    title: "Human-readable insights",
    text: "Analytics are presented as clear business actions.",
  },
] as const;

export function TrustSection() {
  return (
    <section id="trust" className="bg-landing-page">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <SectionHeading centered className="mb-8 md:mb-10">
          Designed for secure, reliable commerce.
        </SectionHeading>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-2.5 rounded-xl border border-landing-border bg-white p-5 md:p-6"
            >
              <item.icon className="h-5 w-5 text-landing-brand" />
              <h3 className="text-[15px] font-semibold text-landing-text">{item.title}</h3>
              <p className="text-sm leading-relaxed text-landing-secondary">{item.text}</p>
            </article>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
