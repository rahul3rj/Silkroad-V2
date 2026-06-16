"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [count, setCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // 1. Lock screen scrolling during load phase
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // 2. High-fidelity counter ticking using cubic-ease-out curve
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const duration = 2000; // 2 seconds loader
    const startTime = performance.now();

    const updateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease-out cubic-like curve: 1 - (1 - x)^4
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easedProgress * 100);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Hold slightly at 100 for premium visual confirmation before morph exit
        setTimeout(() => {
          setIsExiting(true);
        }, 350);
      }
    };

    requestAnimationFrame(updateCounter);
  }, []);

  // 3. SVG morph paths for liquid curtain slide-up
  const curtainVariants: Variants = {
    initial: {
      d: "M0 0 L100 0 L100 100 Q50 100 0 100 Z",
    },
    exit: {
      d: [
        "M0 0 L100 0 L100 100 Q50 100 0 100 Z",
        "M0 0 L100 0 L100 0 Q50 120 0 0 Z", // center sags creating elastic liquid lag
        "M0 0 L100 0 L100 0 Q50 0 0 0 Z",   // snaps fully flat and collapsed
      ],
      transition: {
        duration: 1.4,
        times: [0, 0.55, 1],
        ease: [0.76, 0, 0.24, 1], // premium custom cubic-bezier
      },
    },
  };

  const textAndBarsContainerVariants: Variants = {
    initial: { opacity: 1, y: 0 },
    exit: {
      opacity: 0,
      y: -80,
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  const formattedCount = count < 10 ? `0${count}` : `${count}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center select-none overflow-hidden">
      {/* Background SVG Liquid Canvas (Solid #151515 morphing shade) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none fill-[#ffffff]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          variants={curtainVariants}
          initial="initial"
          animate={isExiting ? "exit" : "initial"}
          onAnimationComplete={(definition) => {
            if (definition === "exit") {
              onComplete();
            }
          }}
        />
      </svg>

      {/* Loader UI Overlay Framing (Ultra-Clean, Minimal) */}
      <motion.div
        variants={textAndBarsContainerVariants}
        initial="initial"
        animate={isExiting ? "exit" : "initial"}
        className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 z-10 pointer-events-none"
      >
        {/* Spacer for top */}
        <div className="h-4" />

        {/* Center Display Panel */}
        <div className="relative flex items-center justify-center my-auto w-full z-20">
          
          {/* Big Premium Double-Digit Counter - Orion Brand Font (Watermark Background) */}
          <div className="absolute font-[orion] text-[15vw] md:text-[18vw] leading-none text-black opacity-[5%] select-none font-bold flex items-baseline pointer-events-none">
            {formattedCount}
            <span className="text-xl md:text-3xl ml-2 select-none pointer-events-none">%</span>
          </div>

          {/* Centered Brand Title - Clean Static Orion Font */}
          <div className="z-10 font-[orion] text-lg md:text-2xl text-black uppercase select-none whitespace-nowrap">
            SILKROAD<sup className="text-[10px] relative -top-3">®</sup>
          </div>
        </div>

        {/* Bottom Horizontal Progress Bar - 80% width with margins */}
        <div className="w-[100%] mx-auto mb-12 md:mb-16 relative z-20 flex justify-center">
          {/* Thick Premium Progress Bar */}
          <motion.div 
            className="w-full h-[2px] bg-black/10 overflow-hidden origin-center"
            animate={isExiting ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count / 100 }}
              style={{ originX: 0 }}
              className="h-full bg-[#222222] w-full"
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
