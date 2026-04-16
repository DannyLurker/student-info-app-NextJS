"use client";
import React from "react";
import LandingPageNavbar from "./LandingPageNavbar";
import { Session } from "@/lib/types/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";

interface LandingPageProps {
  session: Session | undefined;
}

const LandingPage = ({ session }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#F1F5F9] overflow-x-hidden">
      <LandingPageNavbar session={session} />

      {/* Hero Section */}
      <main className="pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-6rem)] py-8 lg:py-12">
            {/* Left Content */}
            <section className="flex flex-col gap-6 order-2 lg:order-1">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 bg-[#1D439B]/10 text-[#1D439B] px-4 py-2 rounded-full w-fit">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Journey excellence through faith.
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="text-[#1D439B]">Journey</span>
                <br />
                <span className="text-[#1D439B]">To</span>
                <br />
                <span className="text-[#B8860B] italic font-serif">
                  Exellence.
                </span>
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base lg:text-lg max-w-lg leading-relaxed">
                Discover a world-class education at Yayasan Pendidikan Advent
                Batam. We blend rigorous academics with character-building
                values to prepare students for a global future.
              </p>

              {/* CTA Buttons */}
              {/* <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  className="bg-[#1D439B] hover:bg-[#16367A] text-white font-semibold px-8 py-6 text-base rounded-lg transition-all duration-200 shadow-lg shadow-[#1D439B]/25"
                >
                  <Link href="/sign-in" className="flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-[#1D439B] hover:text-[#1D439B] font-semibold px-8 py-6 text-base rounded-lg transition-all duration-200 bg-transparent"
                >
                  <Link href="#campus-life">Explore Campus</Link>
                </Button>
              </div> */}
            </section>

            {/* Right Content - Image */}
            <section className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative background shape */}
                <div className="absolute -bottom-4 -left-4 w-full h-full bg-[#F5A623] rounded-3xl opacity-20"></div>
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/banner-hero-section.jpeg"
                    alt="YPAB Students"
                    className="w-full max-w-[500px] lg:max-w-[550px] object-cover"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
