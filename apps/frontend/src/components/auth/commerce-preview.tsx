import { Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCTS = [
  { name: "Everyday Campus Backpack", price: "$49", badge: "Best match", badgeClass: "bg-amber-100 text-amber-800" },
  { name: "Lightweight Travel Pack", price: "$62", badge: "Popular", badgeClass: "bg-amber-100 text-amber-800" },
  { name: "Minimal Laptop Bag", price: "$58", badge: "In stock", badgeClass: "bg-landing-soft text-landing-brand" },
] as const;

function ProductRow({
  name,
  price,
  badge,
  badgeClass,
  compact,
}: {
  name: string;
  price: string;
  badge: string;
  badgeClass: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-landing-border bg-white p-2.5">
        <div className="h-10 w-10 shrink-0 rounded-md bg-landing-border" />
        <p className="text-[11px] text-landing-text">
          {name} · {price} · {badge}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-landing-border bg-white p-3">
      <div className="h-[52px] w-[52px] shrink-0 rounded-lg bg-landing-border" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-landing-text">{name}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badgeClass)}>
            {badge}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-landing-text">{price}</p>
      </div>
    </div>
  );
}

export function CommercePreview({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-landing-soft p-4">
        <p className="text-xs text-landing-text">Lightweight backpack for university</p>
        <ProductRow
          name="Campus Backpack"
          price="$49"
          badge="Best match"
          badgeClass="bg-amber-100 text-amber-800"
          compact
        />
        <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2">
          <span className="text-[11px] font-semibold text-landing-text">
            Saved cart · 2 items
          </span>
          <span className="text-[11px] text-landing-brand">Checkout ready</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-landing-soft p-6 md:p-8">
      <p className="text-sm font-semibold text-landing-text">
        Your shopping picks up where you left off
      </p>

      <div className="flex items-center gap-2.5 rounded-xl border border-landing-border bg-white px-3.5 py-3">
        <Search className="h-4 w-4 shrink-0 text-landing-brand" />
        <p className="text-[13px] text-landing-text">
          I&apos;m looking for a lightweight backpack for university
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {PRODUCTS.map((p) => (
          <ProductRow key={p.name} {...p} />
        ))}
      </div>

      <div className="mt-auto grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="flex flex-col gap-1.5 rounded-xl border border-landing-border bg-white p-3.5">
          <p className="text-xs font-semibold text-landing-text">Saved cart</p>
          <p className="text-[13px] text-landing-secondary">2 items waiting</p>
          <p className="text-xs font-semibold text-landing-brand">Checkout ready</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-landing-border bg-white p-3.5">
          <Package className="h-[18px] w-[18px] text-landing-brand" />
          <p className="text-xs font-semibold text-landing-text">Last order: Delivered</p>
        </div>
      </div>
    </div>
  );
}
