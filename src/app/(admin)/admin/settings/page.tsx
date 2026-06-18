"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// ─── Shared style tokens ──────────────────────────────────────────────────────
const labelClass =
  "block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2";
const inputClass =
  "w-full border border-black/15 px-4 py-3 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white placeholder:text-[#bbb]";
const sectionTitleClass =
  "font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-5";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrandSettings {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  showNewBadge: boolean;
  showSaleBadge: boolean;
  showOutOfStock: boolean;
  allowReviews: boolean;
  _count: { products: number; admins: number };
}

interface AdminUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface PlatformStats {
  totalBrands: number;
  totalProducts: number;
  totalUsers: number;
}

type SettingsPayload =
  | { role: "SUPER_ADMIN"; admin: AdminUser; platform: PlatformStats; brand?: undefined }
  | { role: "ADMIN" | "SUPER_ADMIN"; brand: BrandSettings; admin: AdminUser; platform?: undefined };

// ─── Skeleton placeholder ──────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-black/[0.04] animate-pulse rounded-sm ${className ?? ""}`} />
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({
  value, onChange, label, description, disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-black/5 last:border-0">
      <div>
        <p className="font-[metropolis] text-[12px] text-black tracking-wider">{label}</p>
        {description && (
          <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative w-9 h-5 shrink-0 ml-6 transition-colors duration-200 ${
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        } ${value ? "bg-black" : "bg-black/15"}`}
        aria-checked={value}
        role="switch"
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-black/8 p-5 flex flex-col gap-1">
      <span className="font-[metropolisSemiBold] text-[24px] text-black tracking-tight">
        {value.toLocaleString()}
      </span>
      <span className="font-[metropolis] text-[10px] text-[#787878] tracking-[0.12em] uppercase">
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Super Admin Settings view
// ─────────────────────────────────────────────────────────────────────────────
function SuperAdminSettings({ admin, platform }: { admin: AdminUser; platform: PlatformStats }) {
  return (
    <section className="min-h-screen bg-white pt-6.5 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">Platform</span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Settings</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        <div className="mb-10">
          <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Settings</h1>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
            Platform administration
          </p>
        </div>

        <div className="space-y-8">

          {/* ── Platform Account ── */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Platform Account</p>

            <div className="flex items-center gap-5 border border-black/8 p-5">
              <div className="w-14 h-14 border border-black/10 shrink-0 overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                {admin.image ? (
                  <Image
                    src={admin.image}
                    alt={admin.name ?? "Super Admin"}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-[metropolisSemiBold] text-[18px] text-black/30 uppercase">
                    {(admin.name ?? "S").charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[metropolisSemiBold] text-[12px] text-black tracking-wider truncate">
                  {admin.name ?? "—"}
                </p>
                <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5 truncate">
                  {admin.email ?? "—"}
                </p>
                <p className="font-[metropolis] text-[10px] text-[#bbb] mt-1">
                  Silkroad Platform
                </p>
              </div>
              <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-black shrink-0">
                Super Admin
              </span>
            </div>

            <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-4">
              Your profile photo and name are managed through your account settings.
            </p>
          </div>

          {/* ── Platform Overview ── */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Platform Overview</p>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Brands" value={platform.totalBrands} />
              <StatCard label="Products" value={platform.totalProducts} />
              <StatCard label="Customers" value={platform.totalUsers} />
            </div>
          </div>

          {/* ── Access & Role ── */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Access &amp; Role</p>
            <div className="divide-y divide-black/5">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Role</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                    Full platform access — all brands and data
                  </p>
                </div>
                <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-black">
                  Super Admin
                </span>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Role source</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                    Granted via <span className="font-mono text-[10px]">SUPER_ADMIN_EMAILS</span> environment variable
                  </p>
                </div>
                <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">env</span>
              </div>
              <div className="flex items-start justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Capabilities</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                    Manage brands, assign admins, view all orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Quick Links</p>
            <div className="divide-y divide-black/5">
              {[
                { label: "Manage Brands", href: "/admin/brand-manage", description: "View, assign admins, activate or deactivate brands" },
                { label: "Add New Brand", href: "/admin/brands/add", description: "Register a new brand on the platform" },
                { label: "All Orders", href: "/admin/orders", description: "View and manage orders across all brands" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-4 group"
                >
                  <div>
                    <p className="font-[metropolis] text-[12px] text-black tracking-wider group-hover:underline underline-offset-2">
                      {link.label}
                    </p>
                    <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#bbb] group-hover:text-black transition-colors shrink-0 ml-4">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Admin Settings view (existing logic, unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function BrandAdminSettings({
  brand: initialBrand,
  admin,
}: {
  brand: BrandSettings;
  admin: AdminUser;
}) {
  const [brand, setBrand] = useState<BrandSettings>(initialBrand);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tagline, setTagline] = useState(initialBrand.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState(initialBrand.logoUrl ?? "");
  const [contactEmail, setContactEmail] = useState(initialBrand.contactEmail ?? "");
  const [display, setDisplay] = useState({
    showNewBadge:   initialBrand.showNewBadge,
    showSaleBadge:  initialBrand.showSaleBadge,
    showOutOfStock: initialBrand.showOutOfStock,
    allowReviews:   initialBrand.allowReviews,
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline: tagline || null, logoUrl: logoUrl || null, contactEmail: contactEmail || null, ...display }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to save settings");
      }
      const data = (await res.json()) as { brand: BrandSettings };
      setBrand((prev) => ({ ...prev, ...data.brand }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const productCount = brand._count.products;

  return (
    <section className="min-h-screen bg-white pt-6.5 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">{brand.name}</span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Settings</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        {/* Title */}
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Settings</h1>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">Brand profile &amp; preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase px-8 py-3 transition-all duration-300 flex items-center gap-2.5 disabled:cursor-default ${
              saved ? "bg-white text-black border border-black/20" : saving ? "bg-black/50 text-white cursor-wait" : "bg-black text-white hover:bg-black/80"
            }`}
          >
            {saved ? (<><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Saved</>) : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-7 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="16.5" r="0.75" fill="currentColor" /></svg>
            <span className="font-[metropolis] text-[11px] tracking-[0.08em]">{error}</span>
          </div>
        )}
        {saved && (
          <div className="mb-7 flex items-center gap-3 bg-black text-white px-5 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase">Settings saved successfully</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Brand Profile */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Brand Profile</p>
            <div className="flex items-center gap-5 border border-black/8 p-5 mb-7">
              <div className="w-14 h-14 border border-black/10 shrink-0 overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
                {admin.image ? (
                  <Image src={admin.image} alt={admin.name ?? "Admin"} width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-[metropolisSemiBold] text-[18px] text-black/30 uppercase">{(admin.name ?? brand.name).charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[metropolisSemiBold] text-[12px] text-black tracking-wider truncate">{admin.name ?? "—"}</p>
                <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5 truncate">{admin.email ?? "—"}</p>
                <p className="font-[metropolis] text-[10px] text-[#bbb] mt-1">{brand.name} &nbsp;·&nbsp; {productCount} product{productCount !== 1 ? "s" : ""}</p>
              </div>
              <a href={`/brands/${brand.slug}`} target="_blank" rel="noreferrer"
                className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200 shrink-0 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                View Store
              </a>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Brand Name (read-only)</label>
                <input type="text" value={brand.name} disabled className={`${inputClass} opacity-40 cursor-not-allowed`} />
                <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-1.5">Contact Silkroad support to update your brand name.</p>
              </div>
              <div>
                <label htmlFor="brand-tagline" className={labelClass}>Brand Tagline</label>
                <input id="brand-tagline" type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} placeholder="Your brand's defining phrase" maxLength={200} />
              </div>
              <div>
                <label htmlFor="brand-logo-url" className={labelClass}>Logo URL</label>
                <input id="brand-logo-url" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://cdn.example.com/logo.svg" />
                {logoUrl && (
                  <div className="mt-3 border border-black/8 p-4 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo preview" className="h-5 object-contain max-w-28" onError={(e) => (e.currentTarget.style.display = "none")} />
                    <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider">Logo preview</p>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Brand Slug (read-only)</label>
                <input type="text" value={brand.slug} disabled className={`${inputClass} opacity-40 cursor-not-allowed font-mono text-[12px]`} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Contact &amp; Communications</p>
            <div>
              <label htmlFor="contact-email" className={labelClass}>Contact Email</label>
              <input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="orders@yourbrand.com" />
              <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-1.5">Used for order alerts and platform communications.</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Notifications</p>
            <div>
              <Toggle value={true}  onChange={() => {}} label="New order alerts"         description="Notify when a customer places an order" disabled />
              <Toggle value={true}  onChange={() => {}} label="Low stock warnings"        description="Alert when any SKU drops to 3 units or below" disabled />
              <Toggle value={false} onChange={() => {}} label="Return requests"           description="Notify when a customer initiates a return" disabled />
              <Toggle value={true}  onChange={() => {}} label="Weekly performance report" description="Summary of revenue, orders, and top products" disabled />
              <Toggle value={false} onChange={() => {}} label="Silkroad platform updates" description="News about features and improvements" disabled />
            </div>
            <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-4">Notification preferences coming soon.</p>
          </div>

          {/* Display Preferences */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Display Preferences</p>
            <div>
              <Toggle value={display.showNewBadge}   onChange={(v) => setDisplay((d) => ({ ...d, showNewBadge: v }))}   label="Show 'New In' badge"     description="Display badge on newly listed products" />
              <Toggle value={display.showSaleBadge}  onChange={(v) => setDisplay((d) => ({ ...d, showSaleBadge: v }))}  label="Show sale badges"         description="Display discounted price tags on products" />
              <Toggle value={display.showOutOfStock} onChange={(v) => setDisplay((d) => ({ ...d, showOutOfStock: v }))} label="Show out-of-stock items"  description="Keep listings visible when sold out" />
              <Toggle value={display.allowReviews}   onChange={(v) => setDisplay((d) => ({ ...d, allowReviews: v }))}   label="Allow customer reviews"   description="Enable ratings and reviews on your products" />
            </div>
          </div>

          {/* Account & Security */}
          <div className="border border-black/8 p-7">
            <p className={sectionTitleClass}>Account &amp; Security</p>
            <div className="divide-y divide-black/5">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Admin Role</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">Brand-level administrator</p>
                </div>
                <span className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase border border-black/20 px-2.5 py-1 text-black">Brand Admin</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Commission Rate</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">Silkroad platform fee per transaction</p>
                </div>
                <span className="font-[metropolisSemiBold] text-[14px] text-black">8%</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wider">Payout Schedule</p>
                  <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">Net 30 days</p>
                </div>
                <span className="font-[metropolis] text-[11px] text-[#787878] tracking-wider">Monthly</span>
              </div>
            </div>
            <div className="pt-4 border-t border-black/5 mt-2">
              <button className="font-[metropolis] text-[10px] tracking-[0.1em] uppercase text-[#787878] underline underline-offset-2 hover:text-black transition-colors duration-200">
                Request account deletion
              </button>
            </div>
          </div>

          {/* Bottom save */}
          <div className="pt-2">
            <button onClick={handleSave} disabled={saving || saved}
              className={`w-full py-4 font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-default ${
                saved ? "bg-white text-black border border-black/15" : saving ? "bg-black/50 text-white cursor-wait" : "bg-black text-white hover:bg-black/80"
              }`}
            >
              {saved ? (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>All Changes Saved</>) : saving ? "Saving…" : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — loads data, then renders the correct view
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Failed to load settings");
      }
      const json = await res.json() as SettingsPayload;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  if (loading) {
    return (
      <section className="min-h-screen bg-white pt-6.5 pb-24">
        {/* Breadcrumb */}
        <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
          <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">Admin</span>
          <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
          <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Settings</span>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
          {/* Title */}
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Settings</h1>
              <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">Loading…</p>
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-black/8 p-7 space-y-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="font-[metropolis] text-[13px] text-black/70">{error ?? "Settings could not be loaded."}</p>
          <button onClick={loadSettings} className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black underline underline-offset-2">
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Super-admin with no brand → platform view
  if (data.role === "SUPER_ADMIN" && !data.brand) {
    return <SuperAdminSettings admin={data.admin} platform={data.platform} />;
  }

  // Brand admin (or super-admin who has a brand) → brand view
  return <BrandAdminSettings brand={data.brand!} admin={data.admin} />;
}
