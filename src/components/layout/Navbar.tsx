// Navbar — top navigation bar, adapts between home (transparent/blend) and shop (solid white)
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useLoader } from "@/app/LoaderWrapper";
import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";

interface NavbarProps {
  className?: string;
}

interface NavLinkProps {
  href: string;
  children: string;
  shop?: boolean;
}

function NavLink({ href, children, shop = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`group/link relative block overflow-hidden py-1 uppercase font-[metropolis] tracking-wider text-[11px] ${
        shop ? "text-black" : ""
      }`}
    >
      {/* Normal Text */}
      <span
        className="block transition-transform duration-[600ms] group-hover/link:-translate-y-full"
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </span>
      {/* Rolled Text */}
      <span
        className="absolute left-0 top-1 block transition-transform duration-[600ms] translate-y-full group-hover/link:translate-y-0 opacity-70"
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </span>
      {/* Underline indicator */}
      <span
        className="absolute bottom-0 left-0 w-full h-[1px] bg-current scale-x-0 transition-transform duration-[600ms] origin-left group-hover/link:scale-x-100"
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </Link>
  );
}

export function Navbar({ className = "" }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { isLoaderDone } = useLoader();
  const router = useRouter();

  // Read directly from the real Auth.js session — never stale, no race condition.
  // status: "loading" | "authenticated" | "unauthenticated"
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isSessionLoading = status === "loading";

  const openCart = useUIStore((s) => s.openCart);
  const openAuth = useUIStore((s) => s.openAuth);
  const itemCount = useCartStore((s) => s.itemCount);

  const [visible, setVisible] = useState(true);

  const handleCartClick = () => {
    if (isHome) {
      router.push("/cart");
    } else {
      openCart();
    }
  };

  const handleProfileClick = () => {
    // While session is still loading, do nothing (prevents false "not logged in" flash)
    if (isSessionLoading) return;
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      openAuth();
    }
  };

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isNavVisible = isLoaderDone && visible;

  // ── HOME PAGE: transparent + mix-blend-difference (original behaviour) ──
  if (isHome) {
    return (
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-transparent hover:shadow-sm text-white hover:text-black group mix-blend-difference hover:mix-blend-normal ${
          isNavVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        } ${className}`}
      >
        {/* Curtain Reveal Background */}
        <div
          className="absolute inset-0 bg-white origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-[600ms] z-[-1]"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <header className="w-full text-current">
          <div className="px-10 h-16 flex items-center justify-center relative">
            <Link
              href="/"
              className="text-md tracking-widest font-[orion] text-current absolute left-10 transition-transform duration-300 hover:scale-105"
            >
              SILKROAD<sup className="text-[10px] relative -top-2">®</sup>
            </Link>
            <nav className="hidden md:flex items-center gap-10 text-current">
              <NavLink href="/new-in">New In</NavLink>
              <NavLink href="/men">Men</NavLink>
              <NavLink href="/women">Women</NavLink>
              <NavLink href="/bags">Bags</NavLink>
              <NavLink href="/brands">Brands</NavLink>
            </nav>
            <div className="flex items-center gap-4 absolute right-10">
              <Link
                href="/search"
                className="h-7 w-7 bg-white/10 group-hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 group-hover:hover:bg-black/20 transition-all duration-300 flex justify-center items-center"
              >
                <img
                  className="h-5 transition duration-300 group-hover:invert"
                  src="https://img.icons8.com/?size=100&id=W0xu6u7K9A0F&format=png&color=ffffff"
                  alt="Search"
                />
              </Link>
              <button
                onClick={handleCartClick}
                className="h-7 w-7 bg-white/10 group-hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 group-hover:hover:bg-black/20 transition-all duration-300 flex justify-center items-center relative"
              >
                <img
                  className="h-5 transition duration-300 group-hover:invert"
                  src="https://img.icons8.com/?size=100&id=HjHnQkZoIi19&format=png&color=ffffff"
                  alt="Cart"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black font-[metropolisSemiBold] text-[8px] leading-none border border-black/10 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleProfileClick}
                className="h-7 w-7 bg-white/10 group-hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 group-hover:hover:bg-black/20 transition-all duration-300 flex justify-center items-center"
              >
                <img
                  className="h-5 transition duration-300 group-hover:invert"
                  src="https://img.icons8.com/?size=100&id=15265&format=png&color=ffffff"
                  alt="Profile"
                />
              </button>
            </div>
          </div>
        </header>
      </div>
    );
  }

  // ── SHOP PAGES: solid white, always black text, subtle border ──
  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-black/8 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isNavVisible ? "translate-y-0" : "-translate-y-full"
      } ${className}`}
    >
      <header className="w-full text-black">
        <div className="px-10 h-16 flex items-center justify-center relative">
          <Link
            href="/"
            className="text-md tracking-widest font-[orion] text-black absolute left-10 transition-transform duration-300 hover:scale-105"
          >
            SILKROAD<sup className="text-[10px] relative -top-2">®</sup>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-black">
            <NavLink href="/new-in" shop>
              New In
            </NavLink>
            <NavLink href="/men" shop>
              Men
            </NavLink>
            <NavLink href="/women" shop>
              Women
            </NavLink>
            <NavLink href="/bags" shop>
              Bags
            </NavLink>
            <NavLink href="/brands" shop>
              Brands
            </NavLink>
          </nav>
          <div className="flex items-center gap-4 absolute right-10">
            <Link
              href="/search"
              className="h-7 w-7 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 flex justify-center items-center"
            >
              <img
                className="h-5 invert"
                src="https://img.icons8.com/?size=100&id=W0xu6u7K9A0F&format=png&color=ffffff"
                alt="Search"
              />
            </Link>
            <button
              onClick={handleCartClick}
              className="h-7 w-7 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 flex justify-center items-center relative"
            >
              <img
                className="h-5 invert"
                src="https://img.icons8.com/?size=100&id=HjHnQkZoIi19&format=png&color=ffffff"
                alt="Cart"
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white font-[metropolisSemiBold] text-[8px] leading-none shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={handleProfileClick}
              className="h-7 w-7 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 flex justify-center items-center"
            >
              <img
                className="h-5 invert"
                src="https://img.icons8.com/?size=100&id=15265&format=png&color=ffffff"
                alt="Profile"
              />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
