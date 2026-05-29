"use client";

import { useState } from "react";
import { SectionContainer, SectionHeading } from "./ui";

const TABS = [
  "I know what I want",
  "I'm comparing options",
  "I have a budget",
  "I'm just browsing",
] as const;

const PRODUCTS = [
  {
    name: "Campus Pack 32L",
    vendor: "UniGear Co.",
    price: "$54.99",
    rating: "★ 4.6",
    stock: "In stock",
    reason: "Matches your budget and daily-use need.",
  },
  {
    name: "Day Hiker 28L",
    vendor: "Summit Outdoors",
    price: "$59.00",
    rating: "★ 4.6",
    stock: "In stock",
    reason: "Durable materials · under $60",
  },
  {
    name: "Lite Carry 26L",
    vendor: "Urban Supply",
    price: "$48.50",
    rating: "★ 4.6",
    stock: "In stock",
    reason: "Lightweight for campus commute",
  },
] as const;

export function ProductDiscoverySection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="discovery" className="border-y border-landing-border bg-white">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <SectionHeading centered className="mb-6 md:mb-8">
          Built for how people actually shop.
        </SectionHeading>

        <div className="mb-6 flex flex-wrap justify-center gap-2 md:mb-8">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === i
                  ? "border border-landing-brand bg-landing-brand text-white"
                  : "border border-landing-border bg-landing-page text-landing-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-landing-page p-5 md:p-7">
          <div className="mb-4 rounded-xl bg-landing-soft px-4 py-3">
            <p className="text-sm text-landing-text">
              I need a durable backpack for university under $60.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article
                key={p.name}
                className="flex flex-col gap-2.5 rounded-xl border border-landing-border bg-white p-3.5"
              >
                <div className="aspect-[4/3] w-full rounded-lg bg-landing-border" />
                <h4 className="text-sm font-semibold text-landing-text">{p.name}</h4>
                <p className="text-xs text-landing-secondary">{p.vendor}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-landing-text">{p.price}</span>
                  <span className="text-xs text-landing-secondary">{p.rating}</span>
                </div>
                <p className="text-[11px] text-landing-success">{p.stock}</p>
                <p className="text-[11px] text-landing-brand">{p.reason}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
