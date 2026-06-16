"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: "My Profile", href: "/profile", icon: "person" },
  { label: "My Orders", href: "/orders", icon: "bag" },
  { label: "My Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Addresses", href: "/profile/addresses", icon: "location" },
  { label: "Preferences", href: "/profile/preferences", icon: "settings" },
];

// ── Nav Icons ─────────────────────────────────────────────────────────────────
function NavIcon({ name }: { name: string }) {
  const props = {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none" as const,
  };
  if (name === "person")
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  if (name === "bag")
    return (
      <svg {...props}>
        <path
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "heart")
    return (
      <svg {...props}>
        <path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "location")
    return (
      <svg {...props}>
        <path
          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  // settings
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SideNav({ active }: { active: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Fetch the real image from DB — JWT token may be stale or null for
  // credentials users who uploaded a custom avatar after login.
  const [dbImage, setDbImage] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setDbImage(data?.image ?? null))
      .catch(() => setDbImage(null));
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  // Use DB image (fresh from server) — fall back to authStore image (OAuth),
  // then null while loading (dbImage is undefined until the fetch resolves)
  const avatarSrc = dbImage !== undefined
    ? dbImage
    : (user?.image ?? null);

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="border border-black/8">
        {/* Avatar area */}
        <div className="px-8 py-8 border-b border-black/8 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-black/10 bg-[#f5f5f5] flex items-center justify-center shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={userName || "Profile"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" className="text-black/20">
                <circle cx="30" cy="22" r="12" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M8 52c0-12.15 9.85-22 22-22s22 9.85 22 22"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          {userName && (
            <p className="font-[metropolis] text-[12px] text-[#555] tracking-wider">
              {userName}
            </p>
          )}
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.18em] uppercase text-black">
            My Account
          </p>
        </div>

        {/* Nav */}
        <nav className="py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-8 py-4 font-[metropolis] text-[11px] tracking-[0.12em] uppercase transition-all duration-200 border-l-2 ${
                  isActive
                    ? "border-black text-black bg-black/[0.02]"
                    : "border-transparent text-[#787878] hover:text-black hover:bg-black/[0.015]"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-8 py-5 border-t border-black/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="16,17 21,12 16,7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function AccountShell({
  active,
  breadcrumb,
  title,
  children,
}: {
  active: string;
  breadcrumb: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          {breadcrumb}
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10">
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          {title}
        </h1>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <SideNav active={active} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
