"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Session } from "@/lib/types/session";
import { Menu, X } from "lucide-react";

interface LandingPageNavbarProps {
  session: Session | undefined;
}

// const navLinks = [
//   { name: "About", href: "#about" },
//   { name: "Programs", href: "#programs" },
//   { name: "Admissions", href: "#admissions" },
//   { name: "Campus Life", href: "#campus-life" },
//   { name: "Contact", href: "#contact" },
// ];

const LandingPageNavbar = ({ session }: LandingPageNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-ypab.png"
              alt="YPAB Scholastic"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-xl tracking-tighter text-[#1D439B]">
              Yayasan Pendidikan Advent Batam
            </span>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#1D439B] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div> */}

          {/* CTA Button */}
          <div className="hidden lg:block">
            {session ? (
              <Button className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-6">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-6">
                <Link href="/sign-in">Apply Now</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {/* {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-600 hover:text-[#1D439B] transition-colors px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))} */}
              <div className="pt-2">
                {session ? (
                  <Button className="w-full bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <Button className="w-full bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold">
                    <Link href="/sign-in">Apply Now</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingPageNavbar;
