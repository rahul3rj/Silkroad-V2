// Navbar — top navigation bar, adapts between home (transparent/blend) and shop (solid white)
// Mobile: hamburger button opens a right-side drawer with nav links + action icons.
// Desktop (md+): unchanged — full inline nav + icon row.
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

// ── Mobile Nav Links (larger, stacked in drawer) ──────────────────────────────
const MOBILE_NAV_LINKS = [
  { href: "/new-in", label: "New In" },
  { href: "/men", label: "Men" },
  { href: "/women", label: "Women" },
  { href: "/accessories", label: "Accessories" },
  { href: "/brands", label: "Brands" },
];

// ── Hamburger / Close icon ────────────────────────────────────────────────────
function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <div className="flex flex-col justify-center items-center w-5 h-5 gap-[5px]">
      <span
        className={`block h-[1.5px] w-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${color} ${
          open ? "rotate-45 translate-y-[6.5px]" : ""
        }`}
      />
      <span
        className={`block h-[1.5px] w-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${color} ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <span
        className={`block h-[1.5px] w-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${color} ${
          open ? "-rotate-45 -translate-y-[6.5px]" : ""
        }`}
      />
    </div>
  );
}

export function Navbar({ className = "" }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { isLoaderDone } = useLoader();
  const router = useRouter();

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isSessionLoading = status === "loading";

  const openCart = useUIStore((s) => s.openCart);
  const openAuth = useUIStore((s) => s.openAuth);
  const itemCount = useCartStore((s) => s.itemCount);

  const [visible, setVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lastScrollY = useRef(0);

  const handleCartClick = () => {
    setDrawerOpen(false);
    if (isHome) {
      router.push("/cart");
    } else {
      openCart();
    }
  };

  const handleProfileClick = () => {
    setDrawerOpen(false);
    if (isSessionLoading) return;
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      openAuth();
    }
  };

  // Hide navbar on scroll-down, show on scroll-up
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

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isNavVisible = isLoaderDone && visible;

  // ─────────────────────────────────────────────────────────────────────────
  // Shared: Mobile drawer — rendered once, used by both home + shop variants
  // ─────────────────────────────────────────────────────────────────────────
  const mobileDrawer = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className={`fixed top-0 right-0 z-[999] h-full w-[78vw] max-w-[320px] bg-white flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-black/8 shrink-0">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="font-[orion] text-black tracking-widest text-sm"
          >
            SILKROAD<sup className="text-[9px] relative -top-1.5">®</sup>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <HamburgerIcon open={true} color="bg-black" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-6 pt-8 pb-4 gap-1 flex-1">
          {MOBILE_NAV_LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className="group flex items-center justify-between py-4 border-b border-black/6 last:border-0"
              style={{
                transitionDelay: drawerOpen ? `${i * 50 + 80}ms` : "0ms",
              }}
            >
              <span className="font-[metropolis] text-black text-[13px] uppercase tracking-[0.12em] group-hover:translate-x-1 transition-transform duration-300">
                {label}
              </span>
              <svg width="5" height="9" viewBox="0 0 5 9" fill="none" className="text-black/30 group-hover:text-black transition-colors duration-200">
                <path d="M1 1l3 3.5L1 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Action icons row at bottom */}
        <div className="px-6 py-6 border-t border-black/8 shrink-0">
          <p className="font-[metropolis] text-[9px] tracking-[0.2em] uppercase text-black/30 mb-4">
            Account &amp; More
          </p>
          <div className="flex items-center gap-4">
            {/* Search */}
            <Link
              href="/search"
              onClick={() => setDrawerOpen(false)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center transition-colors duration-200">
                <img
                  className="h-5 invert"
                  src="https://img.icons8.com/?size=100&id=W0xu6u7K9A0F&format=png&color=ffffff"
                  alt="Search"
                />
              </div>
              <span className="font-[metropolis] text-[9px] tracking-widest uppercase text-black/50">Search</span>
            </Link>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center transition-colors duration-200 relative">
                <img
                  className="h-5 invert"
                  src="https://img.icons8.com/?size=100&id=HjHnQkZoIi19&format=png&color=ffffff"
                  alt="Cart"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-white font-[metropolisSemiBold] text-[8px] leading-none animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="font-[metropolis] text-[9px] tracking-widest uppercase text-black/50">Cart</span>
            </button>

            {/* Profile */}
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center transition-colors duration-200">
                <img
                  className="h-5 invert"
                  src="https://img.icons8.com/?size=100&id=15265&format=png&color=ffffff"
                  alt="Profile"
                />
              </div>
              <span className="font-[metropolis] text-[9px] tracking-widest uppercase text-black/50">
                {isLoggedIn ? "Profile" : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // HOME PAGE: transparent + mix-blend-difference
  // ─────────────────────────────────────────────────────────────────────────
  if (isHome) {
    return (
      <>
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
            <div className="px-5 md:px-10 h-16 flex items-center justify-between md:justify-center relative">
              {/* Logo */}
              <Link
                href="/"
                className="text-md tracking-widest font-[orion] text-current md:absolute md:left-10 transition-transform duration-300 hover:scale-105"
              >
                SILKROAD<sup className="text-[10px] relative -top-2">®</sup>
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden md:flex items-center gap-10 text-current">
                <NavLink href="/new-in">New In</NavLink>
                <NavLink href="/men">Men</NavLink>
                <NavLink href="/women">Women</NavLink>
                <NavLink href="/accessories">Accessories</NavLink>
                <NavLink href="/brands">Brands</NavLink>
              </nav>

              {/* Desktop action icons */}
              <div className="hidden md:flex items-center gap-4 absolute right-10">
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

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label="Toggle menu"
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:scale-95 transition-all duration-200"
              >
                <HamburgerIcon open={drawerOpen} color="bg-white" />
              </button>
            </div>
          </header>
        </div>

        {mobileDrawer}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SHOP PAGES: solid white, always black text, subtle border
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-black/8 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        } ${className}`}
      >
        <header className="w-full text-black">
          <div className="px-5 md:px-10 h-16 flex items-center justify-between md:justify-center relative">
            {/* Logo */}
            <Link
              href="/"
              className="text-md tracking-widest font-[orion] text-black md:absolute md:left-10 transition-transform duration-300 hover:scale-105"
            >
              SILKROAD<sup className="text-[10px] relative -top-2">®</sup>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-10 text-black">
              <NavLink href="/new-in" shop>New In</NavLink>
              <NavLink href="/men" shop>Men</NavLink>
              <NavLink href="/women" shop>Women</NavLink>
              <NavLink href="/accessories" shop>Accessories</NavLink>
              <NavLink href="/brands" shop>Brands</NavLink>
            </nav>

            {/* Desktop action icons */}
            <div className="hidden md:flex items-center gap-4 absolute right-10">
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-black/5 active:scale-95 transition-all duration-200"
            >
              <HamburgerIcon open={drawerOpen} color="bg-black" />
            </button>
          </div>
        </header>
      </div>

      {mobileDrawer}
    </>
  );
}
