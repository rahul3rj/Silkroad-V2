"use client";

import Link from "next/link";
import React from "react";

interface FooterLinkProps {
  name: string;
  href: string;
  disabled?: boolean;
}

function FooterLink({ name, href, disabled }: FooterLinkProps) {
  if (disabled) {
    return (
      <span className="block text-zinc-400/50 font-[metropolis] text-[13px] tracking-wide cursor-not-allowed py-0.5 select-none">
        {name} (Coming Soon)
      </span>
    );
  }

  const isExternal = href.startsWith("http");
  const LinkComponent = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <LinkComponent
      {...linkProps}
      className="block text-zinc-400 hover:text-black font-[metropolis] text-[13px] tracking-wide transition-all duration-500 hover:translate-x-1.5 py-0.5"
    >
      {name}
    </LinkComponent>
  );
}

export function Footer() {
  const exploreLinks = [
    { name: "Collections", href: "/brands" },
    { name: "New Arrivals", href: "/new-in" },
    { name: "Men", href: "/men" },
    { name: "Women", href: "/women" },
    { name: "Accessories", href: "/accessories" },
  ];

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Vision", href: "/vision" },
    { name: "Journal", href: "/journal" },
    { name: "Careers", href: "/careers", disabled: true },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { name: "Instagram", href: "https://instagram.com" },
    { name: "Behance", href: "https://behance.net" },
    { name: "Pinterest", href: "https://pinterest.com" },
    { name: "X / Twitter", href: "https://twitter.com" },
  ];

  return (
    <footer className="w-full bg-white text-black select-none z-10 relative">
      <div className="w-full mx-auto px-6 md:px-10 pt-10 pb-10">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
          {/* Left Block: Coordinates, Branding, Copy */}
          <div className="lg:col-span-7 flex flex-col justify-start items-start">
            {/* Coordinates in Jaipur, India */}
            <div className="flex flex-col text-[10px] md:text-[11px] font-[metropolis] tracking-[0.18em] text-zinc-400 leading-relaxed uppercase">
              <span>26.9124° N / 75.7873° E</span>
              <span className="flex items-center gap-1">
                [ JAIPUR <span className="text-[10px]">🇮🇳</span> ]
              </span>
            </div>

            {/* Custom Brand Title */}
            <h2 className="font-[metropolis] text-[34px] md:text-[44px] font-medium tracking-tight text-black leading-[1.12] mt-8 uppercase max-w-[550px]">
              DESIGNED FOR THE NEXT <br className="hidden md:inline" />
              <span className="font-[royal] text-5xl md:text-6xl text-black mr-2 font-normal normal-case">
                Culture
              </span>
              <span>SHIFT.</span>
            </h2>

            {/* Muted Copywriting Statement */}
            <p className="text-[12px] md:text-xs font-[metropolis] text-[#787878] max-w-[420px] mt-6 leading-relaxed">
              Silkroad blends futuristic aesthetics, experimental fashion, and
              modern street culture into a visual experience crafted for the
              bold generation.
            </p>
          </div>

          {/* Right Block: Sitemap and Social Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 md:gap-8 w-full flex justify-end">
            {/* Explore Column */}
            <div className="flex flex-col">
              <h4 className="text-[13px] md:text-sm font-[metropolisSemiBold] text-black mb-2 tracking-wide">
                Explore
              </h4>
              <nav className="flex flex-col gap-1">
                {exploreLinks.map((link) => (
                  <FooterLink
                    key={link.name}
                    {...link}
                  />
                ))}
              </nav>
            </div>

            {/* Company Column */}
            <div className="flex flex-col">
              <h4 className="text-[13px] md:text-sm font-[metropolisSemiBold] text-black mb-2 tracking-wide">
                Company
              </h4>
              <nav className="flex flex-col gap-1">
                {companyLinks.map((link) => (
                  <FooterLink
                    key={link.name}
                    {...link}
                  />
                ))}
              </nav>
            </div>

            {/* Socials Column */}
            <div className="flex flex-col">
              <h4 className="text-[13px] md:text-sm font-[metropolisSemiBold] text-black mb-2 tracking-wide">
                Socials
              </h4>
              <nav className="flex flex-col gap-1">
                {socialLinks.map((link) => (
                  <FooterLink
                    key={link.name}
                    {...link}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Logo & Copyright Section */}
        <div className="w-full flex flex-col items-center justify-center mt-20 md:mt-10 pt-8 border-t border-zinc-50">
          {/* Copyright notice */}
          <p className="text-zinc-500 font-[metropolis] text-[11px] md:text-xs tracking-wider">
            © 2026 SilkRoad. All rights reserved.
          </p>

          {/* Large Centered Logo */}
          <div className="relative mt-8 select-none">
            <span className="font-[orion] text-xl sm:text-xl md:text-xl tracking-[0.25em] text-black leading-none pl-[0.25em] inline-block font-bold">
              SILKROAD
            </span>
            {/* Minimalist superscript square indicator */}
            <sup className="text-[10px] relative -top-2">®</sup>
          </div>
        </div>
      </div>
    </footer>
  );
}
