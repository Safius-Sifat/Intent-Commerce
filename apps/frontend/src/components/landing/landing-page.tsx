import { FinalCtaSection } from "./final-cta";
import { LandingFooter } from "./footer";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works";
import { LandingNavbar } from "./navbar";
import { ProblemSection } from "./problem-section";
import { ProductDiscoverySection } from "./product-discovery";
import { SolutionSection } from "./solution-section";
import { TrustSection } from "./trust-section";
import { VendorPreviewSection } from "./vendor-preview";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-landing-page">
      <LandingNavbar />
      <main className="flex flex-col">
        <HeroSection />
        <div className="order-2 lg:order-3">
          <HowItWorksSection />
        </div>
        <div className="order-3 lg:order-2">
          <ProblemSection />
        </div>
        <SolutionSection />
        <ProductDiscoverySection />
        <VendorPreviewSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
