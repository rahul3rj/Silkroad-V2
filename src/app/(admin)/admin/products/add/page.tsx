"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  womenSubcategories,
  menSubcategories,
  bagsSubcategories,
} from "@/lib/config/categories";

const CATEGORIES = [
  { value: "women", label: "Women" },
  { value: "men",   label: "Men" },
  { value: "bags",  label: "Bags" },
];

const ALL_SIZES: Record<string, string[]> = {
  women: ["XS", "S", "M", "L", "XL", "XXL"],
  men:   ["S", "M", "L", "XL", "XXL"],
  bags:  ["One Size"],
};

const SUBCATEGORY_MAP: Record<string, string[]> = {
  women: womenSubcategories.filter((s) => s !== "View All"),
  men:   menSubcategories.filter((s) => s !== "View All"),
  bags:  bagsSubcategories.filter((s) => s !== "View All"),
};

const PRESET_COLORS = [
  { name: "Noir",       hex: "#1a1a1a" },
  { name: "Ivory",      hex: "#f5f0e8" },
  { name: "Camel",      hex: "#c19a6b" },
  { name: "Sage",       hex: "#8a9e7a" },
  { name: "Blush",      hex: "#e8b4b8" },
  { name: "Stone",      hex: "#b5a99a" },
  { name: "Champagne",  hex: "#d4af7a" },
  { name: "Navy",       hex: "#1a2a4a" },
  { name: "Burgundy",   hex: "#7a1a2e" },
  { name: "Cognac",     hex: "#9e5a2a" },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface ColorEntry { name: string; hex: string }
interface StockEntry { size: string; quantity: number }

interface FormState {
  name: string; slug: string; category: string; subcategory: string;
  price: string; salePrice: string; description: string;
  colors: ColorEntry[]; sizes: string[]; stock: StockEntry[];
  tags: string; isNew: boolean; isSale: boolean;
  // 3 image slots: [0] = primary (imageSrc), [1] = gallery 2, [2] = gallery 3
  imageSlots: [string, string, string];
}

const INITIAL: FormState = {
  name: "", slug: "", category: "women", subcategory: "", price: "",
  salePrice: "", description: "", colors: [{ name: "", hex: "#1a1a1a" }],
  sizes: [], stock: [], tags: "", isNew: true, isSale: false,
  imageSlots: ["", "", ""],
};

const labelClass = "block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2";
const inputClass = "w-full border border-black/15 px-4 py-3 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white placeholder:text-[#bbb]";
const sectionTitleClass = "font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-5";

export default function AddProductPage() {
  const { user } = useAuth();
  const brandName = user?.brandName ?? "Your Brand";
  const brand = { name: brandName };
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [colorPresetOpen, setColorPresetOpen] = useState(false);
  // Track upload state per slot (0=primary, 1=gallery2, 2=gallery3)
  const [uploading, setUploading] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [uploadErrors, setUploadErrors] = useState<[string, string, string]>(["", "", ""]);

  const update = (field: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (val: string) => {
    update("name", val);
    update("slug", slugify(val));
  };

  const toggleSize = (size: string) => {
    const has = form.sizes.includes(size);
    const newSizes = has ? form.sizes.filter((s) => s !== size) : [...form.sizes, size];
    const newStock: StockEntry[] = newSizes.map((s) => ({
      size: s,
      quantity: form.stock.find((st) => st.size === s)?.quantity ?? 0,
    }));
    update("sizes", newSizes);
    update("stock", newStock);
  };

  const updateStock = (size: string, qty: number) =>
    update("stock", form.stock.map((s) => s.size === size ? { ...s, quantity: Math.max(0, qty) } : s));

  const addColor = () => update("colors", [...form.colors, { name: "", hex: "#c19a6b" }]);
  const removeColor = (i: number) => update("colors", form.colors.filter((_, idx) => idx !== i));
  const updateColor = (i: number, field: keyof ColorEntry, val: string) =>
    update("colors", form.colors.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  /** Fire-and-forget delete of a Supabase-hosted image. Ignores errors silently — UI never blocks on this. */
  const deleteUploadedImage = (url: string) => {
    if (!url || !url.includes("supabase")) return; // skip local paths and plain URLs
    fetch("/api/admin/products/upload-image", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => { /* non-blocking */ });
  };

  /** Clear a slot and delete its Supabase image if it was an upload. */
  const clearSlot = (slotIndex: 0 | 1 | 2) => {
    const currentUrl = form.imageSlots[slotIndex];
    if (currentUrl) deleteUploadedImage(currentUrl);
    setForm((prev) => {
      const slots = [...prev.imageSlots] as [string, string, string];
      slots[slotIndex] = "";
      return { ...prev, imageSlots: slots };
    });
    // Clear any error for this slot too
    setUploadErrors((prev) => {
      const next = [...prev] as [string, string, string];
      next[slotIndex] = "";
      return next;
    });
  };

  const handleImageUpload = async (slotIndex: 0 | 1 | 2, file: File) => {
    // Validate client-side first
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadErrors((prev) => {
        const next = [...prev] as [string, string, string];
        next[slotIndex] = "Only JPG, PNG, or WebP allowed.";
        return next;
      });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadErrors((prev) => {
        const next = [...prev] as [string, string, string];
        next[slotIndex] = "Max file size is 15 MB.";
        return next;
      });
      return;
    }

    setUploading((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[slotIndex] = true;
      return next;
    });
    setUploadErrors((prev) => {
      const next = [...prev] as [string, string, string];
      next[slotIndex] = "";
      return next;
    });

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      // Always read as text first — if the server returns an HTML error page
      // parsing with res.json() directly would throw "unexpected token".
      const text = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(res.ok ? "Invalid server response." : `Server error (${res.status})`);
      }

      if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
      if (!json.url) throw new Error("Server returned no URL.");

      setForm((prev) => {
        const slots = [...prev.imageSlots] as [string, string, string];
        slots[slotIndex] = json.url!;
        return { ...prev, imageSlots: slots };
      });
    } catch (err) {
      setUploadErrors((prev) => {
        const next = [...prev] as [string, string, string];
        next[slotIndex] = err instanceof Error ? err.message : "Upload failed.";
        return next;
      });
    } finally {
      setUploading((prev) => {
        const next = [...prev] as [boolean, boolean, boolean];
        next[slotIndex] = false;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Build the payload — NO brandId (the server forces it from the session)
    const filledImages = form.imageSlots.filter(Boolean);
    const primaryImage = filledImages[0] ?? "";

    if (!primaryImage) {
      setError("Please upload at least one product image.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      subcategory: form.subcategory,
      description: form.description.trim(),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      imageSrc: primaryImage,
      images: filledImages,
      colors: form.colors.filter((c) => c.name.trim() && c.hex),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isNew: form.isNew,
      isSale: form.isSale,
      variants: form.stock.map((s) => ({ size: s.size, stock: s.quantity })),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not publish the product.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSizes = ALL_SIZES[form.category] ?? ALL_SIZES.women;
  const subcategories = SUBCATEGORY_MAP[form.category] ?? [];

  if (submitted) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 border border-black/10 flex items-center justify-center mx-auto mb-7">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
            Product Listed
          </p>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-9">
            <strong className="text-black font-[metropolisSemiBold]">{form.name}</strong> has been added to your {brand.name} catalogue.
          </p>
          <button
            onClick={() => { setForm(INITIAL); setSubmitted(false); }}
            className="font-[metropolisSemiBold] text-[9px] tracking-[0.22em] uppercase text-white bg-black px-10 py-4 hover:bg-black/80 transition-colors duration-300"
          >
            Add Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white pt-12 pb-24">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">{brand.name}</span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Add Product</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">

        {/* ── Title row ── */}
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Add Product</h1>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
              New listing for {brand.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] hover:text-black transition-colors duration-200 flex items-center gap-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
        </div>

        <div className={`grid gap-10 ${showPreview ? "grid-cols-3" : "grid-cols-1 max-w-2xl"}`}>
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className={showPreview ? "col-span-2" : "col-span-1"}>
            <div className="space-y-8">

              {/* Basic Info */}
              <div className="border border-black/8 p-7">
                <p className={sectionTitleClass}>Basic Information</p>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Product Name *</label>
                    <input id="product-name" type="text" required placeholder="e.g. Silk Draped Maxi Dress"
                      value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Slug</label>
                    <input type="text" placeholder="auto-generated" value={form.slug}
                      onChange={(e) => update("slug", e.target.value)} className={`${inputClass} text-[#787878]`} />
                  </div>
                  <div>
                    <label className={labelClass}>Description *</label>
                    <textarea id="product-description" required rows={3} placeholder="Describe the piece…"
                      value={form.description} onChange={(e) => update("description", e.target.value)}
                      className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Tags (comma-separated)</label>
                    <input type="text" placeholder="silk, maxi, evening" value={form.tags}
                      onChange={(e) => update("tags", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="border border-black/8 p-7">
                <p className={sectionTitleClass}>Category</p>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select id="product-category" value={form.category} required
                      onChange={(e) => { update("category", e.target.value); update("subcategory", ""); update("sizes", []); update("stock", []); }}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Subcategory *</label>
                    <select id="product-subcategory" value={form.subcategory} required
                      onChange={(e) => update("subcategory", e.target.value)} className={inputClass}
                    >
                      <option value="">Select…</option>
                      {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border border-black/8 p-7">
                <p className={sectionTitleClass}>Pricing</p>
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className={labelClass}>Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[metropolis] text-[13px] text-[#787878]">$</span>
                      <input id="product-price" type="number" min="0" required placeholder="499"
                        value={form.price} onChange={(e) => update("price", e.target.value)}
                        className={`${inputClass} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Sale Price (optional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[metropolis] text-[13px] text-[#787878]">$</span>
                      <input type="number" min="0" placeholder="Leave blank if full price"
                        value={form.salePrice}
                        onChange={(e) => { update("salePrice", e.target.value); update("isSale", e.target.value.length > 0); }}
                        className={`${inputClass} pl-8`} />
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6 pt-2 border-t border-black/5">
                  {[
                    { key: "isNew" as const, label: "Mark as New Arrival" },
                    { key: "isSale" as const, label: "On Sale" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 border flex items-center justify-center transition-all duration-200 ${form[key] ? "bg-black border-black" : "border-black/25"}`}
                        onClick={() => update(key, !form[key])}
                      >
                        {form[key] && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="border border-black/8 p-7">
                <div className="flex items-center justify-between mb-5">
                  <p className={sectionTitleClass}>Colors</p>
                  <div className="relative">
                    <button type="button" onClick={() => setColorPresetOpen(!colorPresetOpen)}
                      className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] hover:text-black transition-colors"
                    >
                      + Preset
                    </button>
                    {colorPresetOpen && (
                      <div className="absolute right-0 top-6 bg-white border border-black/15 p-3 z-10 w-52 shadow-sm">
                        <p className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] mb-2">Quick Add</p>
                        <div className="grid grid-cols-2 gap-1">
                          {PRESET_COLORS.map((preset) => (
                            <button key={preset.hex} type="button"
                              onClick={() => { if (!form.colors.some((c) => c.hex === preset.hex)) { update("colors", [...form.colors, preset]); } setColorPresetOpen(false); }}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/[0.03] transition-colors text-left"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.hex }} />
                              <span className="font-[metropolis] text-[10px] text-[#787878]">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {form.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input type="color" value={color.hex} onChange={(e) => updateColor(i, "hex", e.target.value)}
                        className="w-9 h-9 border border-black/15 cursor-pointer p-0.5 bg-white" />
                      <input type="text" placeholder="Color name (e.g. Ivory)" value={color.name}
                        onChange={(e) => updateColor(i, "name", e.target.value)}
                        className={`${inputClass} flex-1 py-2`} />
                      <input type="text" placeholder="#hex" value={color.hex}
                        onChange={(e) => updateColor(i, "hex", e.target.value)}
                        className={`${inputClass} w-24 py-2 font-mono text-[11px]`} />
                      {form.colors.length > 1 && (
                        <button type="button" onClick={() => removeColor(i)}
                          className="font-[metropolis] text-[#bbb] hover:text-black transition-colors text-sm">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addColor}
                  className="mt-3 font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200">
                  + Add Color
                </button>
              </div>

              {/* Sizes & Stock */}
              <div className="border border-black/8 p-7">
                <p className={sectionTitleClass}>Sizes & Stock</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {availableSizes.map((size) => {
                    const selected = form.sizes.includes(size);
                    return (
                      <button key={size} type="button" onClick={() => toggleSize(size)}
                        className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase px-5 py-2 border transition-all duration-200 ${
                          selected ? "bg-black text-white border-black" : "text-[#787878] border-black/15 hover:border-black/40 hover:text-black"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {form.sizes.length > 0 && (
                  <div>
                    <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mb-3">
                      Quantity per size
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.sizes.map((size) => {
                        const entry = form.stock.find((s) => s.size === size);
                        return (
                          <div key={size} className="flex items-center gap-2 border border-black/10 px-4 py-2.5">
                            <span className="font-[metropolis] text-[10px] tracking-wider uppercase text-[#787878] w-8">{size}</span>
                            <button type="button" onClick={() => updateStock(size, (entry?.quantity ?? 0) - 1)}
                              className="font-[metropolis] text-[#bbb] hover:text-black transition-colors text-lg leading-none">−</button>
                            <span className="font-[metropolisSemiBold] text-[13px] text-black w-5 text-center">{entry?.quantity ?? 0}</span>
                            <button type="button" onClick={() => updateStock(size, (entry?.quantity ?? 0) + 1)}
                              className="font-[metropolis] text-[#bbb] hover:text-black transition-colors text-lg leading-none">+</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Images — 3 slots */}
              <div className="border border-black/8 p-7">
                <p className={sectionTitleClass}>Product Images</p>
                <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mb-5">
                  Upload a file or paste a URL for each image. The first is the primary hero image shown in listings and the product detail gallery.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {([0, 1, 2] as const).map((slotIndex) => {
                    const url = form.imageSlots[slotIndex];
                    const isUploading = uploading[slotIndex];
                    const slotError = uploadErrors[slotIndex];
                    const isPrimary = slotIndex === 0;

                    return (
                      <div key={slotIndex} className="flex flex-col gap-2">
                        {/* Slot label */}
                        <p className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878]">
                          {isPrimary ? "Primary *" : `Image ${slotIndex + 1}`}
                        </p>

                        {/* Drop zone / preview */}
                        <label
                          className={`relative block aspect-[3/4] border-2 border-dashed cursor-pointer transition-colors duration-200 overflow-hidden group ${
                            url
                              ? "border-black/20 bg-[#f9f9f9]"
                              : "border-black/12 bg-[#fafafa] hover:border-black/30 hover:bg-black/[0.015]"
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleImageUpload(slotIndex, file);
                          }}
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(slotIndex, file);
                              e.target.value = "";
                            }}
                          />

                          {isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <svg className="animate-spin text-black/30" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <p className="font-[metropolis] text-[9px] tracking-wider text-[#bbb] uppercase">Uploading…</p>
                            </div>
                          ) : url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Image ${slotIndex + 1}`} className="w-full h-full object-cover object-top" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-[metropolisSemiBold] text-[9px] tracking-[0.18em] uppercase text-white">
                                  Replace
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  clearSlot(slotIndex);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black flex items-center justify-center transition-colors duration-150"
                                aria-label="Remove image"
                              >
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                              </button>
                              {isPrimary && (
                                <span className="absolute bottom-2 left-2 font-[metropolis] text-[8px] tracking-[0.15em] uppercase bg-black text-white px-2 py-0.5">
                                  Primary
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black/20">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                              <p className="font-[metropolis] text-[9px] tracking-[0.1em] uppercase text-[#bbb]">
                                Click or drag
                              </p>
                              <p className="font-[metropolis] text-[8px] text-[#ccc]">JPG · PNG · WebP</p>
                            </div>
                          )}
                        </label>

                        {/* URL input — always visible below the drop zone */}
                        <div className="flex gap-1.5">
                          <input
                            type="url"
                            placeholder="Or paste image URL…"
                            value={url}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm((prev) => {
                                const slots = [...prev.imageSlots] as [string, string, string];
                                slots[slotIndex] = val;
                                return { ...prev, imageSlots: slots };
                              });
                              // Clear any upload error when typing a URL
                              if (val) {
                                setUploadErrors((prev) => {
                                  const next = [...prev] as [string, string, string];
                                  next[slotIndex] = "";
                                  return next;
                                });
                              }
                            }}
                            className="flex-1 border border-black/12 px-2.5 py-2 font-[metropolis] text-[10px] text-black outline-none focus:border-black/40 transition-colors duration-200 bg-white placeholder:text-[#ccc] min-w-0"
                          />
                          {url && (
                            <button
                              type="button"
                              onClick={() => clearSlot(slotIndex)}
                              className="shrink-0 w-7 h-7 border border-black/12 flex items-center justify-center text-[#bbb] hover:text-black hover:border-black/30 transition-colors duration-150"
                              aria-label="Clear URL"
                            >
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Per-slot error */}
                        {slotError && (
                          <p className="font-[metropolis] text-[9px] text-red-500 tracking-wider leading-tight">{slotError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              {error && (
                <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-40">
                  {submitting ? "Publishing…" : "Publish Product"}
                </button>
                <button type="button" onClick={() => { setForm(INITIAL); setError(null); }}
                  className="px-8 py-4 border border-black/15 font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:border-black hover:text-black transition-all duration-200">
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* ── Preview panel ── */}
          {showPreview && (
            <div className="col-span-1 sticky top-16 self-start">
              <div className="border border-black/8 overflow-hidden">
                <div className="px-6 py-4 border-b border-black/8">
                  <p className="font-[metropolis] text-[9px] tracking-[0.22em] uppercase text-[#787878]">Live Preview</p>
                </div>
                <div className="p-6">
                  <div className="aspect-[3/4] bg-[#f5f5f5] mb-5 relative overflow-hidden">
                    {form.imageSlots[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.imageSlots[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="font-[metropolis] text-[10px] tracking-wider text-[#bbb] uppercase">No image</p>
                      </div>
                    )}
                    {form.isNew && (
                      <span className="absolute top-3 left-3 font-[metropolis] text-[8px] tracking-[0.2em] uppercase bg-black text-white px-2 py-1">
                        New In
                      </span>
                    )}
                    {form.isSale && (
                      <span className="absolute top-3 right-3 font-[metropolis] text-[8px] tracking-[0.2em] uppercase bg-black text-white px-2 py-1">
                        Sale
                      </span>
                    )}
                  </div>

                  <p className="font-[metropolis] text-[9px] tracking-[0.22em] uppercase text-[#787878] mb-1">{brand.name}</p>
                  <p className="font-[metropolisSemiBold] text-[15px] text-black leading-tight mb-0.5">{form.name || "Product Name"}</p>
                  {form.subcategory && <p className="font-[metropolis] text-[11px] text-[#787878] mb-3">{form.subcategory}</p>}

                  <div className="flex items-center gap-2 mb-3">
                    {form.isSale && form.salePrice ? (
                      <>
                        <span className="font-[metropolisSemiBold] text-[14px] text-black">${form.salePrice}</span>
                        <span className="font-[metropolis] text-[12px] text-[#bbb] line-through">${form.price}</span>
                      </>
                    ) : (
                      <span className="font-[metropolisSemiBold] text-[14px] text-black">{form.price ? `$${form.price}` : "$—"}</span>
                    )}
                  </div>

                  {form.colors.some((c) => c.hex) && (
                    <div className="flex gap-1.5 mb-3">
                      {form.colors.filter((c) => c.hex).map((c, i) => (
                        <div key={i} title={c.name} className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  )}

                  {form.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.sizes.map((s) => (
                        <span key={s} className="font-[metropolis] text-[9px] tracking-wider uppercase border border-black/15 px-2 py-0.5 text-[#787878]">{s}</span>
                      ))}
                    </div>
                  )}

                  {form.description && (
                    <p className="font-[metropolis] text-[11px] text-[#787878] leading-relaxed tracking-wider mt-3 line-clamp-3">
                      {form.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
