import { ShoppingCart } from "lucide-react";

function BenefitCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-2.5 rounded-[14px] border border-landing-border bg-white p-[18px]">
      <h3 className="text-[15px] font-semibold text-landing-text">{title}</h3>
      <p className="text-[13px] leading-relaxed text-landing-secondary">{description}</p>
      {children}
    </article>
  );
}

export function ShopperBenefitsPanel({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-landing-soft p-4">
        <p className="text-[13px] font-semibold text-landing-text">
          Your cart stays with you · 3 saved items
        </p>
        <p className="text-xs text-landing-secondary">
          Find products by intent · Track every order
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3.5 rounded-3xl bg-landing-soft p-7">
      <BenefitCard
        title="Your cart stays with you"
        description="Add products now and return anytime."
      >
        <div className="flex flex-col gap-2 rounded-[10px] bg-landing-page p-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-landing-brand" />
            <span className="text-xs text-landing-text">3 saved items</span>
          </div>
          <p className="text-xs text-landing-secondary">Estimated total: $148</p>
        </div>
      </BenefitCard>

      <BenefitCard
        title="Find products by intent"
        description="Describe what you need and compare relevant options."
      >
        <div className="flex flex-col gap-2 rounded-[10px] bg-landing-page p-3">
          <p className="text-xs text-landing-text">
            I need a daily backpack under $60
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              Best match
            </span>
            <span className="rounded-full bg-landing-soft px-2 py-0.5 text-[10px] font-medium text-landing-brand">
              In stock
            </span>
          </div>
        </div>
      </BenefitCard>

      <BenefitCard
        title="Track every order"
        description="See order status from checkout to delivery."
      >
        <div className="flex flex-col gap-2 rounded-[10px] bg-landing-page p-3">
          <p className="text-xs text-landing-text">
            Ordered → Processing → Delivered
          </p>
          <p className="text-[11px] text-landing-success">Last order delivered</p>
        </div>
      </BenefitCard>
    </div>
  );
}
