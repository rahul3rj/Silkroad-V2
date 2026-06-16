"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

// ── Profile skeleton ───────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      {/* Avatar section skeleton */}
      <div className="border border-black/8 p-6">
        <div className="h-2 bg-black/5 rounded w-24 mb-5" />
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-black/6 shrink-0" />
          <div className="flex flex-col gap-3">
            <div className="h-8 bg-black/6 rounded-full w-32" />
            <div className="h-2 bg-black/4 rounded w-40" />
          </div>
        </div>
      </div>
      {/* Fields grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {["First Name", "Last Name", "Email", "Phone", "Date of Birth"].map((label) => (
          <div key={label}>
            <div className="h-2 bg-black/5 rounded w-20 mb-2" />
            <div className="h-[46px] bg-black/5 rounded w-full" />
          </div>
        ))}
      </div>
      {/* Save button skeleton */}
      <div className="flex justify-end pt-2">
        <div className="h-[52px] bg-black/8 rounded-full w-36" />
      </div>
    </div>
  );
}


const NAV_ITEMS = [
  { label: "My Profile", href: "/profile", icon: "person" },
  { label: "My Orders", href: "/orders", icon: "bag" },
  { label: "My Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Addresses", href: "/profile/addresses", icon: "location" },
  { label: "Preferences", href: "/profile/preferences", icon: "settings" },
];

// ── Avatar component shared between sidebar and main content ──────────────────
function Avatar({
  src,
  size = "md",
  onClick,
}: {
  src: string | null;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const dim =
    size === "sm" ? "w-14 h-14" : size === "lg" ? "w-28 h-28" : "w-20 h-20";
  const iconSize = size === "sm" ? 28 : size === "lg" ? 52 : 40;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${dim} rounded-full overflow-hidden border border-black/10 relative group shrink-0 bg-[#f5f5f5] flex items-center justify-center`}
      aria-label="Change profile picture"
    >
      {src ? (
        <img
          src={src}
          alt="Profile"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 60 60"
          fill="none"
          className="text-black/20"
        >
          <circle
            cx="30"
            cy="22"
            r="12"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M8 52c0-12.15 9.85-22 22-22s22 9.85 22 22"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
      {/* Hover overlay */}
      {onClick && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SideNav({
  active,
  avatarSrc,
  userName,
}: {
  active: string;
  avatarSrc: string | null;
  userName: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="border border-black/8">
        {/* Avatar area */}
        <div className="px-8 py-8 border-b border-black/8 flex flex-col items-center text-center gap-3">
          <Avatar src={avatarSrc} size="md" />
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: "",
    dob: "",
    newsletter: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(true);

  // ── Profile picture state — declared BEFORE the useEffect that uses setAvatarSrc ──
  const [avatarSrc, setAvatarSrc] = useState<string | null>(user?.image ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load real profile data from DB on mount ─────────────────────────────────
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          dob: data.dob ?? "",
          newsletter: false,
        });
        if (data.image) setAvatarSrc(data.image);
      })
      .catch(() => {/* silently ignore network errors on load */})
      .finally(() => setFormLoading(false));
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so the same file can be re-selected
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError("File is too large. Maximum 10 MB.");
      return;
    }

    // Show a local preview immediately while upload runs
    const previewUrl = URL.createObjectURL(file);
    setAvatarSrc(previewUrl);
    setAvatarUploading(true);
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setAvatarError(data.error ?? "Upload failed. Please try again.");
        // Revert preview on failure
        setAvatarSrc(user?.image ?? null);
        return;
      }

      // Replace blob preview with the real Supabase URL
      URL.revokeObjectURL(previewUrl);
      setAvatarSrc(data.imageUrl);
    } catch {
      setAvatarError("Network error during upload. Please try again.");
      setAvatarSrc(user?.image ?? null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      await fetch("/api/users/me/avatar", { method: "DELETE" });
      if (avatarSrc?.startsWith("blob:")) URL.revokeObjectURL(avatarSrc);
      setAvatarSrc(null);
    } catch {
      setAvatarError("Failed to remove photo. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const setField = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          dob: form.dob || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save. Please try again.");
        return;
      }

      // Sync form with what was actually saved
      setForm((f) => ({
        ...f,
        firstName: data.firstName ?? f.firstName,
        lastName: data.lastName ?? f.lastName,
        email: data.email ?? f.email,
        phone: data.phone ?? "",
        dob: data.dob ?? "",
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const userName =
    form.firstName || form.lastName
      ? `${form.firstName} ${form.lastName}`.trim()
      : "";

  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          My Profile
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10">
        {/* Page title */}
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          My Account
        </h1>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* ── Left: Sidebar ── */}
          <SideNav
            active="/profile"
            avatarSrc={avatarSrc}
            userName={userName}
          />

          {/* ── Right: Content ── */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="border-b border-black/8 pb-5 mb-8">
              <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
                My Profile
              </h2>
            </div>

            {/* Loading skeleton */}
            {formLoading && <ProfileSkeleton />}

            {/* Save success banner */}
            {!formLoading && saved && (
              <div className="mb-6 flex items-center gap-3 bg-black text-white px-5 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase">
                  Profile updated successfully
                </span>
              </div>
            )}

            {/* Error banner */}
            {!formLoading && error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 px-5 py-3">
                <span className="font-[metropolis] text-[11px] tracking-[0.12em] text-red-700">
                  {error}
                </span>
              </div>
            )}

            {!formLoading && (
            <form onSubmit={handleSave} className="space-y-7">
              {/* ── Profile Picture Section ── */}
              <div className="border border-black/8 p-6">
                <p className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-5">
                  Profile Picture
                </p>

                <div className="flex items-center gap-6">
                  {/* Large avatar preview */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={avatarSrc}
                      size="lg"
                      onClick={!avatarUploading ? handleAvatarClick : undefined}
                    />
                    {/* Uploading spinner overlay */}
                    {avatarUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={avatarUploading}
                    />

                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                      className="flex items-center gap-2.5 px-5 py-2.5 border border-black/20 font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {avatarUploading ? "Uploading…" : avatarSrc ? "Change Photo" : "Upload Photo"}
                    </button>

                    {avatarSrc && !avatarUploading && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex items-center gap-2.5 px-5 py-2.5 font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        Remove Photo
                      </button>
                    )}

                    {avatarError && (
                      <p className="font-[metropolis] text-[10px] text-red-600 tracking-wider">
                        {avatarError}
                      </p>
                    )}

                    <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider leading-relaxed">
                      JPG, PNG or WebP · Max 10 MB · Auto-compressed to 400×400
                    </p>
                  </div>
                </div>
              </div>

              {/* Required note */}
              <div className="flex justify-end">
                <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">
                  Required fields *
                </span>
              </div>

              {/* ── Personal Info Grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* First Name */}
                <div>
                  <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setField("dob", e.target.value)}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Newsletter preference */}
              <div className="pt-2">
                <p className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-4">
                  Communication Preferences
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={(e) => setField("newsletter", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 border border-black/25 peer-checked:bg-black peer-checked:border-black transition-all duration-200 flex items-center justify-center">
                      {form.newsletter && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3l2 2 4-4"
                            stroke="white"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider leading-relaxed">
                    I would like to receive newsletters and exclusive offers
                    from Silkroad
                  </span>
                </label>
              </div>

              {/* Password section */}
              <div className="border-t border-black/8 pt-6">
                <p className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-4">
                  Password
                </p>
                <button
                  type="button"
                  className="font-[metropolis] text-[11px] text-black underline underline-offset-2 tracking-wider hover:opacity-60 transition-opacity duration-200"
                >
                  Change my password
                </button>
              </div>

              {/* Save button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
