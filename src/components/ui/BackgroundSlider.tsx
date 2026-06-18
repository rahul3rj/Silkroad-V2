"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLoader } from "@/app/LoaderWrapper";

const IMAGES = [
  "/images/bg1.png",
  "/images/bg2.png",
  "/images/bg3.png",
  "/images/bg4.png",
];

const SLIDE_TEXTS = [
  { subtitle: "New collection", title: "ELEGANT" },
  { subtitle: "Summer season", title: "MINIMALIST" },
  { subtitle: "Exclusive craft", title: "HERITAGE" },
  { subtitle: "Modern luxury", title: "COUTURE" },
];

const AUTO_PLAY_INTERVAL = 15000; // 15 seconds
const GRID_COLS = 18;
const GRID_ROWS = 12;

interface SplitTextProps {
  text: string;
  active: boolean;
  type: "subtitle" | "title";
}

function SplitText({ text, active, type }: SplitTextProps) {
  const letters = text.split("");

  return (
    <div
      className={`overflow-hidden flex justify-end select-none pointer-events-none ${
        type === "subtitle"
          ? "text-xl md:text-5xl text-white/95 -mb-3 font-[royal]"
          : "text-6xl sm:text-7xl md:text-[9rem] font-extrabold tracking-tighter text-white leading-none mix-blend-difference"
      }`}
    >
      {letters.map((char, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden relative"
          style={{
            width: char === " " ? "0.25em" : "auto",
            verticalAlign: "bottom",
            paddingBottom: "0.15em",
            marginBottom: "-0.15em",
          }}
        >
          <span
            className="inline-block transition-all duration-[1200ms]"
            style={{
              transform: active ? "translateY(0)" : "translateY(115%)",
              opacity: active ? 1 : 0,
              transitionDelay: active ? `${i * 30}ms` : "0ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionProperty: "transform, opacity",
            }}
          >
            {char}
          </span>
        </span>
      ))}
    </div>
  );
}

export function BackgroundSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { isLoaderDone } = useLoader();

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, AUTO_PLAY_INTERVAL);
  };

  useEffect(() => {
    if (isLoaderDone) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoaderDone]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (isLoaderDone) {
      startTimer(); // Reset the interval timer on user interaction
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div
        className={`absolute bottom-5 left-10 z-99 font-[metropolis] text-white text-xs transition-opacity duration-1000 ${isLoaderDone ? "opacity-100" : "opacity-0"}`}
      >
        @2026
      </div>
      {/* CSS Keyframes for Progress Bar Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slider-progress-height {
          0% { height: 0%; }
          100% { height: 100%; }
        }
        .animate-slider-progress-height {
          animation: slider-progress-height ${AUTO_PLAY_INTERVAL}ms linear forwards;
        }
        .grid-trail-cell {
          background-color: #ffffff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
          background-size: 80px 80px;
          mix-blend-mode: difference;
          opacity: 0;
          transition: opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity;
        }
        .grid-trail-cell:hover {
          opacity: 1;
          transition: none !important;
        }
      `,
        }}
      />

      {/* Images and Texts with cross-fade transition */}
      {IMAGES.map((src, index) => {
        const isActive = index === currentIndex;
        const slideText = SLIDE_TEXTS[index];
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              isActive
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-top"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Subtle premium dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />

            {/* Interactive grid trail — desktop only (performance) */}
            {isActive && (
              <div
                className="absolute inset-0 pointer-events-auto select-none overflow-hidden hidden md:grid"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
                  <div key={i} className="grid-trail-cell" />
                ))}
              </div>
            )}

            {/* Awwwards-level split-character text reveal */}
            <div className="absolute bottom-16 right-8 md:bottom-5 md:right-10 text-right z-30 select-none pointer-events-none mix-blend-difference">
              <SplitText
                text={slideText.subtitle}
                active={isActive && isLoaderDone}
                type="subtitle"
              />
              <SplitText
                text={slideText.title}
                active={isActive && isLoaderDone}
                type="title"
              />
            </div>
          </div>
        );
      })}

      {/* Premium Vertical Slider Indicators on the Left */}
      <div
        className={`absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaderDone ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
      >
        {IMAGES.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className="group relative flex items-center justify-center focus:outline-none"
              aria-label={`Go to slide ${index + 1}`}
            >
              {/* Visual vertical loading bar */}
              <div
                className={`w-[3.5px] rounded-full overflow-hidden transition-all duration-[600ms] ${
                  isActive
                    ? "h-19 bg-white/20"
                    : "h-9 bg-white/40 group-hover:bg-white/70"
                }`}
              >
                {isActive && isLoaderDone && (
                  <div className="w-full bg-white animate-slider-progress-height rounded-full" />
                )}
              </div>

              {/* Sleek slide number indicator displayed to the right on hover */}
              <span className="absolute left-6 text-[10px] tracking-widest text-white/0 font-medium scale-90 transition-all duration-300 group-hover:text-white/70 group-hover:scale-100 whitespace-nowrap select-none pointer-events-none">
                0{index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
