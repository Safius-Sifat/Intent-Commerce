import { SectionContainer, SectionHeading } from "./ui";

const METRICS = [
  { label: "Revenue today", value: "$2,418", delta: "↑ 8%", deltaClass: "text-landing-success" },
  { label: "Orders today", value: "34", delta: "↑ 3", deltaClass: "text-landing-success" },
  { label: "Low stock alerts", value: "7", delta: "Action", deltaClass: "text-landing-warning" },
  { label: "Top product", value: "Cotton tote", delta: "—", deltaClass: "text-landing-text" },
] as const;

const FORECAST_BARS = [24, 36, 32, 44, 40, 52, 48, 56, 50, 60, 58, 64];

export function VendorPreviewSection() {
  return (
    <section id="vendor-preview" className="bg-landing-page">
      <SectionContainer className="py-8 md:py-16 lg:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex flex-col gap-5 lg:max-w-[420px]">
            <SectionHeading>
              Give vendors answers, not just charts.
            </SectionHeading>
            <p className="text-base leading-relaxed text-landing-secondary">
              Turn sales data into clear next steps — forecasts, alerts, and
              plain-language business questions.
            </p>
          </div>

          <div className="flex-1 rounded-2xl border border-landing-border bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)] md:p-7">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col gap-1 rounded-[10px] bg-landing-page p-3.5"
                >
                  <span className="text-[11px] text-landing-secondary">{m.label}</span>
                  <span className="text-lg font-bold text-landing-text">{m.value}</span>
                  <span className={`text-[11px] ${m.deltaClass}`}>{m.delta}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[13px] font-semibold text-landing-text">Demand forecast</p>
              <div className="flex h-16 items-end gap-1.5">
                {FORECAST_BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded bg-landing-brand opacity-75"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[10px] bg-landing-soft px-3.5 py-3">
              <p className="text-[13px] text-landing-text">
                Which products are likely to run out next week?
              </p>
            </div>

            <div className="mt-3 rounded-[10px] border border-amber-200/50 bg-amber-50 p-3.5">
              <p className="text-xs font-semibold text-landing-warning">Stock insight</p>
              <p className="mt-1 text-[13px] text-landing-text">
                Cotton tote bags may stock out in 9 days. Recommended restock: 120
                units.
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
