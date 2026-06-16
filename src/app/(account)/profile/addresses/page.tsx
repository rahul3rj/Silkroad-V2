"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { useAuthStore } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white";

// ── Address card ──────────────────────────────────────────────────────────────
function AddressCard({
  addr,
  onEdit,
  onDelete,
  onSetDefault,
  disabled,
}: {
  addr: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className={`border p-6 transition-all duration-200 ${
        addr.isDefault ? "border-black" : "border-black/8 hover:border-black/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {addr.isDefault && (
            <span className="font-[metropolis] text-[8px] tracking-[0.15em] uppercase text-white bg-black px-2 py-0.5">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            disabled={disabled}
            className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878] hover:text-black transition-colors duration-200 disabled:opacity-40"
          >
            Edit
          </button>
          <span className="text-black/15 text-[10px]">·</span>
          <button
            onClick={onDelete}
            disabled={disabled}
            className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-[#787878] hover:text-red-600 transition-colors duration-200 disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Address details */}
      <p className="font-[metropolis] text-[13px] text-black tracking-wide">
        {addr.fullName}
      </p>
      <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wide mt-1 leading-relaxed">
        {addr.line1}
        {addr.line2 && <>, {addr.line2}</>}
        <br />
        {addr.city}, {addr.state} {addr.postcode}
        <br />
        {addr.country}
      </p>
      {addr.phone && (
        <p className="font-[metropolis] text-[11px] text-[#aaa] tracking-wider mt-1.5">
          {addr.phone}
        </p>
      )}

      {!addr.isDefault && (
        <button
          onClick={onSetDefault}
          disabled={disabled}
          className="mt-4 font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200 disabled:opacity-40"
        >
          Set as default
        </button>
      )}
    </div>
  );
}

// ── Address form ──────────────────────────────────────────────────────────────
type FormData = Omit<Address, "id" | "isDefault">;

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<Address>;
  onSave: (data: FormData & { isDefault?: boolean }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData & { isDefault: boolean }>({
    fullName: initial?.fullName ?? "",
    line1:    initial?.line1    ?? "",
    line2:    initial?.line2    ?? "",
    city:     initial?.city     ?? "",
    state:    initial?.state    ?? "",
    postcode: initial?.postcode ?? "",
    country:  initial?.country  ?? "",
    phone:    initial?.phone    ?? "",
    isDefault: initial?.isDefault ?? false,
  });

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="border border-black/8 p-6 space-y-5"
    >
      <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black pb-4 border-b border-black/8">
        {initial?.id ? "Edit Address" : "New Address"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full name */}
        <div className="sm:col-span-2">
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Line 1 */}
        <div className="sm:col-span-2">
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            required
            value={form.line1}
            onChange={(e) => set("line1", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Line 2 */}
        <div className="sm:col-span-2">
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            value={form.line2 ?? ""}
            onChange={(e) => set("line2", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* City */}
        <div>
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            City *
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* State */}
        <div>
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            State / Province *
          </label>
          <input
            type="text"
            required
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Postcode */}
        <div>
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={form.postcode}
            onChange={(e) => set("postcode", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Country */}
        <div>
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Country *
          </label>
          <div className="relative">
            <select
              required
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className={`${inputCls} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">Select country…</option>
              {[
                "United States", "United Kingdom", "France", "Germany",
                "Italy", "Japan", "Singapore", "UAE", "India",
                "Canada", "Australia", "Netherlands", "Spain", "Switzerland",
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/40"
              width="10" height="6" viewBox="0 0 10 6" fill="none"
            >
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Set as default checkbox */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set("isDefault", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-4 h-4 border border-black/25 peer-checked:bg-black peer-checked:border-black transition-all duration-200 flex items-center justify-center">
                {form.isDefault && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider">
              Set as default shipping address
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200 disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-10 py-3.5 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Saving…
            </>
          ) : (
            "Save Address"
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AddressesPage() {
  const storeUser = useAuthStore((s) => s.user);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);

  // Pre-fill defaults for new address form — name from authStore, phone from API
  const [newFormDefaults, setNewFormDefaults] = useState<Partial<Address>>({});

  // ── Fetch addresses + user phone on mount ────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    try {
      const [addrRes, userRes] = await Promise.all([
        fetch("/api/addresses"),
        fetch("/api/users/me"),
      ]);
      const addrData = await addrRes.json();
      const userData = await userRes.json();

      if (addrRes.ok) setAddresses(addrData);

      // Build defaults for the new-address form
      const fullName = storeUser
        ? `${storeUser.firstName} ${storeUser.lastName}`.trim()
        : "";
      const phone = userRes.ok ? (userData.phone ?? "") : "";
      setNewFormDefaults({ fullName, phone });
    } catch {
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, [storeUser]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]); // eslint-disable-line react-hooks/set-state-in-effect

  const editingAddr = editId ? addresses.find((a) => a.id === editId) : undefined;

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async (data: FormData & { isDefault?: boolean }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to save."); return; }
      await loadAddresses();
      setShowForm(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Update ───────────────────────────────────────────────────────────────────
  const handleUpdate = async (data: FormData & { isDefault?: boolean }) => {
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to update."); return; }
      await loadAddresses();
      setEditId(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to remove.");
        return;
      }
      await loadAddresses();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Set default ──────────────────────────────────────────────────────────────
  const handleSetDefault = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) { setError("Failed to update default."); return; }
      await loadAddresses();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell active="/profile/addresses" breadcrumb="Addresses" title="My Account">
      {/* Section header */}
      <div className="border-b border-black/8 pb-5 mb-8 flex items-center justify-between">
        <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
          Saved Addresses
        </h2>
        {!showForm && !editId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black border border-black/15 px-4 py-2 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Address
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 px-5 py-3">
          <span className="font-[metropolis] text-[11px] text-red-700 tracking-wider">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="border border-black/8 p-6 animate-pulse">
                <div className="h-3 bg-black/5 rounded w-1/4 mb-4" />
                <div className="h-3 bg-black/5 rounded w-1/3 mb-2" />
                <div className="h-3 bg-black/5 rounded w-1/2 mb-2" />
                <div className="h-3 bg-black/5 rounded w-2/5" />
              </div>
            ))}
          </div>
        )}

        {/* New address form */}
        {!loading && showForm && (
          <AddressForm
            initial={newFormDefaults}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}

        {/* Edit form */}
        {!loading && editId && editingAddr && (
          <AddressForm
            initial={editingAddr}
            onSave={handleUpdate}
            onCancel={() => setEditId(null)}
            saving={saving}
          />
        )}

        {/* Address cards */}
        {!loading && !showForm && !editId && addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            addr={addr}
            onEdit={() => setEditId(addr.id)}
            onDelete={() => handleDelete(addr.id)}
            onSetDefault={() => handleSetDefault(addr.id)}
            disabled={saving}
          />
        ))}

        {/* Empty state */}
        {!loading && !showForm && !editId && addresses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border border-black/10 flex items-center justify-center mx-auto mb-6">
              <svg width="16" height="18" viewBox="0 0 24 24" fill="none" className="text-black/30">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-2">
              No saved addresses
            </p>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mb-8 max-w-xs mx-auto">
              Add an address to speed up your checkout experience.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 transition-all duration-300"
            >
              Add Address
            </button>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
