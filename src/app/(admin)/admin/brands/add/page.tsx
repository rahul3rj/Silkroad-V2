"use client";

// /admin/brands/add — SUPER_ADMIN only.
// Create a new brand with all required fields from the schema.

import { useState } from "react";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface FormState {
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string;
  website: string;
}

const INITIAL: FormState = {
  name: "",
  slug: "",
  tagline: "",
  logoUrl: "",
  website: "",
};

const labelClass =
  "block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2";
const inputClass =
  "w-full border border-black/15 px-4 py-3 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white placeholder:text-[#bbb]";
const hintClass = "font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-1.5";

export default function AddBrandPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; slug: string } | null>(null);

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (val: string) => {
    update("name", val);
    update("slug", slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name:    form.name.trim(),
      slug:    form.slug.trim(),
      tagline: form.tagline.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      website: form.website.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create brand.");
      setCreated({ name: json.brand.name, slug: json.brand.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (created) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 border border-black/10 flex items-center justify-center mx-auto mb-7">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            Brand Created
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-2">
            <strong className="text-black font-[metropolisSemiBold]">{created.name}</strong> has been added to the platform.
          </p>
          <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mb-9">
            Slug: {created.slug}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setForm(INITIAL); setCreated(null); }}
              className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-8 py-4 hover:bg-black/80 transition-colors duration-300"
            >
              Add Another
            </button>
            <a
              href="/admin/brand-manage"
              className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] border border-black/15 px-8 py-4 hover:border-black hover:text-black transition-all duration-200"
            >
              Manage Brands
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-white pt-12 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">Platform</span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Add Brand</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-10">
        <div className="mb-10">
          <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Add Brand</h1>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
            Register a new luxury brand on the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Identity ── */}
          <div className="border border-black/8 p-7 space-y-5">
            <p className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black">
              Brand Identity
            </p>

            {/* Name */}
            <div>
              <label className={labelClass}>Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Louis Vuitton"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Slug */}
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                type="text"
                required
                placeholder="e.g. louis-vuitton"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className={`${inputClass} font-mono text-[12px] text-[#555]`}
              />
              <p className={hintClass}>
                Used in URLs — lowercase letters, numbers, and hyphens only. Auto-generated from the brand name.
              </p>
            </div>

            {/* Tagline */}
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                type="text"
                placeholder="e.g. The art of travel & savoir-faire"
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className={inputClass}
                maxLength={200}
              />
              <p className={hintClass}>Short brand description shown on the brand page. Optional.</p>
            </div>
          </div>

          {/* ── Online Presence ── */}
          <div className="border border-black/8 p-7 space-y-5">
            <p className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black">
              Online Presence
            </p>

            {/* Logo URL */}
            <div>
              <label className={labelClass}>Logo URL</label>
              <input
                type="url"
                placeholder="https://cdn.example.com/logo.svg"
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>
                Full URL to the brand&apos;s horizontal wordmark (SVG or PNG). Shown in the navbar brand selector and on the brand page. Optional.
              </p>
              {/* Logo preview */}
              {form.logoUrl && (
                <div className="mt-3 inline-flex items-center gap-3 border border-black/8 px-4 py-3 bg-[#fafafa]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="h-6 w-auto max-w-[120px] object-contain grayscale"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="font-[metropolis] text-[9px] text-[#bbb] tracking-wider uppercase">Preview</span>
                </div>
              )}
            </div>

            {/* Website */}
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                placeholder="https://www.louisvuitton.com"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>Official brand website. Optional.</p>
            </div>
          </div>

          {/* ── Submit ── */}
          {error && (
            <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-40"
            >
              {submitting ? "Creating…" : "Create Brand"}
            </button>
            <button
              type="button"
              onClick={() => { setForm(INITIAL); setError(null); }}
              className="px-8 py-4 border border-black/15 font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:border-black hover:text-black transition-all duration-200"
            >
              Reset
            </button>
          </div>

          <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider leading-relaxed">
            After creating a brand, go to <strong className="text-black">Brand Manage</strong> to assign an admin user to it.
          </p>
        </form>
      </div>
    </section>
  );
}
