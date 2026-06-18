"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminMobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // 1024px covers mobile phones and portrait tablets.
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    // Return empty wrapper during SSR hydration to prevent mismatch.
    return <div className="invisible">{children}</div>;
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0c0c0c] flex flex-col justify-between p-8 text-white select-none">
        {/* Top Header */}
        <div className="flex justify-between items-center w-full">
          <div className="font-[orion] text-sm tracking-[0.25em] text-white">
            SILKROAD<sup className="text-[9px] relative -top-1.5">®</sup>
          </div>
          <div className="font-[metropolis] text-[10px] tracking-[0.15em] text-white/40 uppercase">
            Admin Portal
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-8">
          {/* Animated Premium Desktop Icon */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.08] mb-2">
            <svg
              className="w-10 h-10 text-white/80 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                ry="2"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="21"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite]" />
          </div>

          <div className="space-y-3">
            <h1 className="font-[metropolisSemiBold] text-base tracking-[0.15em] uppercase text-white">
              Desktop Access Required
            </h1>
            <p className="font-[metropolis] text-[12px] leading-relaxed text-white/60 tracking-wide">
              The Silkroad Admin Portal is optimized for desktop computers and larger displays.
              Please switch to a computer device to manage your brand and inventory.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center w-full gap-4 max-w-xs mx-auto">
          <Link
            href="/"
            className="w-full py-4 bg-white text-black font-[metropolisSemiBold] text-[10px] tracking-[0.2em] uppercase text-center hover:bg-white/90 active:bg-white/80 transition-all duration-300 border border-white"
          >
            Go to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
