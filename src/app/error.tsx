"use client";

import { Navbar } from "@/components/layout/Navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
        {/* Minimalist Square Border Box */}
        <div className="w-16 h-16 border border-black/10 flex items-center justify-center mb-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/35">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Header */}
        <h1 className="font-[metropolisSemiBold] text-[10px] tracking-[0.3em] uppercase text-black/40 mb-3">
          Application Error
        </h1>

        {/* Title */}
        <h2 className="font-[metropolisSemiBold] text-[13px] tracking-[0.2em] uppercase text-black mb-3">
          Something went wrong
        </h2>

        {/* Description / Message */}
        <p className="font-[metropolis] text-[10px] tracking-[0.08em] text-[#787878] leading-relaxed mb-10 max-w-[280px]">
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>

        {/* Action Button */}
        <button
          onClick={reset}
          className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-10 py-4 hover:bg-black/80 transition-colors duration-300"
        >
          Try Again
        </button>
      </main>
    </div>
  );
}
