"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  brandName: string;
  brandSlug: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  userImage?: string | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
  adminOnly?: boolean; // shown only for ADMIN (not SUPER_ADMIN)
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Add Product",
    href: "/admin/products/add",
    superAdminOnly: false,
    adminOnly: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Add Brand",
    href: "/admin/brands/add",
    superAdminOnly: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Brand Manage",
    href: "/admin/brand-manage",
    superAdminOnly: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ brandName, brandSlug, role = "ADMIN", userImage }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && isSuperAdmin) return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="border border-black/8">
        {/* Brand header */}
        <div className="px-8 py-8 border-b border-black/8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 border border-black/10 overflow-hidden bg-[#f5f5f5] shrink-0">
            {userImage ? (
              <Image
                src={userImage}
                alt={brandName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-[metropolisSemiBold] text-[18px] text-black/40 uppercase">
                  {brandName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">
              {brandName}
            </p>
            <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
              {isSuperAdmin ? "Platform Admin" : "Brand Portal"}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-8 py-4 font-[metropolis] text-[11px] tracking-[0.12em] uppercase transition-all duration-200 border-l-2 ${
                  active
                    ? "border-black text-black bg-black/[0.02]"
                    : "border-transparent text-[#787878] hover:text-black hover:bg-black/[0.015]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-8 py-5 border-t border-black/8 space-y-3">
          <Link
            href={`/brands/${brandSlug}`}
            className="flex items-center gap-3 font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            View Storefront
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Exit Admin
          </Link>
        </div>
      </div>
    </aside>
  );
}
