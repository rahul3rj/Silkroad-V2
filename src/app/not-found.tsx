"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
        {/* Minimalist Square Border Box */}
        <div className="w-16 h-16 border border-black/10 flex items-center justify-center mb-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/35">
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 404 Header */}
        <h1 className="font-[metropolisSemiBold] text-[10px] tracking-[0.3em] uppercase text-black/40 mb-3">
          Error 404
        </h1>

        {/* Title */}
        <h2 className="font-[metropolisSemiBold] text-[13px] tracking-[0.2em] uppercase text-black mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="font-[metropolis] text-[10px] tracking-[0.08em] text-[#787878] leading-relaxed mb-10 max-w-[280px]">
          The page you are looking for does not exist or has been moved. Explore our latest collection.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-10 py-4 hover:bg-black/80 transition-colors duration-300"
        >
          Return Home
        </Link>
      </main>
    </div>
  );
}
