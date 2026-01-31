import HeroSection from "@/components/landing/HeroSection";
import PrizePoolSection from "@/components/landing/PrizePoolSection";
import RulesSection from "@/components/landing/RulesSection";
import ApplicationSection from "@/components/landing/ApplicationSection";
import { HashScrollHandler } from "@/components/landing/HashScrollHandler";
import { getRules } from "@/lib/rules";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rules = await getRules();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <HashScrollHandler />
      <HeroSection />
      <PrizePoolSection />
      <RulesSection rules={rules} />
      <ApplicationSection />
    </div>
  );
}
