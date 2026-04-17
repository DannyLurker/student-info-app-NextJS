"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types/session";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageNavbarProps {
  session: Session | undefined;
}

const LandingPageNavbar = ({ session }: LandingPageNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
                Yayasan Pendidikan
                <br className="sm:hidden" />
                Advent Batam
              </span>
            </div>

            {/* Links */}
            {/* <div></div> */}

            {/* Desktop Login/dashboard Button */}
            <div className="hidden lg:block">
              {session ? (
                <Button className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-6">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-6">
                  <Link href="/sign-in">Login</Link>
                </Button>
              )}
            </div>

            {/* Mobile: Login Button + Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {session ? (
                <Button
                  size="sm"
                  className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-4"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#F5A623] hover:bg-[#E09512] text-white font-semibold px-4"
                >
                  <Link href="/sign-in">Login</Link>
                </Button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar - Slides from left */}
      <div
        className={`fixed top-0 left-0 h-full w-[60%] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4">
            <span className="font-bold text-lg text-[#1D439B]">Menu</span>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4">
            <p className="text-sm text-gray-500">
              Navigation links coming soon...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPageNavbar;
