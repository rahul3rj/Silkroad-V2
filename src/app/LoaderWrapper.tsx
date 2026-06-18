"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";
import { AuthDrawer } from "@/components/auth/AuthDrawer";

export const LoaderContext = createContext({ isLoaderDone: false });
export const useLoader = () => useContext(LoaderContext);

export default function LoaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Always start with a stable SSR-safe state so server and client initial
  // renders match. We adjust to the real state in the effect below.
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isLoaderDone = !isLoading;

  // Runs only on the client after mount — safe to read pathname / window here.
  useEffect(() => {
    setMounted(true);
    if (isHome) {
      // Show the intro loader for the home page
      setIsLoading(true);
      setShowContent(false);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoading && isHome) {
      // Delay visibility of actual content interactive classes just a tad for smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isHome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowContent(true);
    }
  }, [isLoading, isHome, mounted]);

  return (
    <LoaderContext.Provider value={{ isLoaderDone }}>
      <AnimatePresence mode="wait">
        {isLoading && isHome && (
          <Loader 
            key="loader" 
            onComplete={() => setIsLoading(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`min-h-full flex flex-col w-full origin-center ${
          !showContent && isHome ? "pointer-events-none select-none" : ""
        }`}
      >
        {children}
      </motion.div>

      {/* Global Drawers */}
      <AuthDrawer />
    </LoaderContext.Provider>
  );
}

