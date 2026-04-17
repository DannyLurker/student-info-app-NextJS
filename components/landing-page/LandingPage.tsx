"use client";
import LandingPageNavbar from "./sections/LandingPageNavbar";
import { Session } from "@/lib/types/session";
import LandingPageHeroSection from "./sections/LandingPageHeroSection";

interface LandingPageProps {
  session: Session | undefined;
}

const LandingPage = ({ session }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F1F5F9] overflow-x-hidden">
      <LandingPageNavbar session={session} />

      {/* Hero Section */}
      <LandingPageHeroSection />
    </div>
  );
};

export default LandingPage;
