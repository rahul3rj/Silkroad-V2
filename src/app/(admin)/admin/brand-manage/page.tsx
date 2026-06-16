"use client";

// /admin/brand-manage — SUPER_ADMIN only.
// Search for any account and assign/revoke a brand-admin role.
// Access is enforced server-side: middleware (route guard) + the API guards.

import { useCallback, useEffect, useState } from "react";

interface BrandLite {
  id: string;
  name: string;
  slug: string;
  _count?: { admins: number; products: number };
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  brandId: string | null;
  brand: { id: string; name: string; slug: string } | null;
  createdAt: string;
}

const labelClass = "block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2";
const inputClass = "w-full border border-black/15 px-4 py-3 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white placeholder:text-[#bbb]";

function RoleBadge({ role }: { role: UserRow["role"] }) {
  const map: Record<UserRow["role"], string> = {
    SUPER_ADMIN: "bg-black text-white border-black",
    ADMIN: "border-black/40 text-black",
    USER: "border-black/15 text-[#787878]",
  };
  const label = role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Brand Admin" : "Customer";
  return (
    <span className={`font-[metropolis] text-[9px] tracking-[0.15em] uppercase border px-2.5 py-1 ${map[role]}`}>
      {label}
    </span>
  );
}

export default function BrandManagePage() {
  const [brands, setBrands] = useState<BrandLite[]>([]);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-row brand selection (for the assign dropdown)
  const [selectedBrand, setSelectedBrand] = useState<Record<string, string>>({});

  // Load brands once
  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Failed to load users.");
      setUsers(await res.json());
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, loadUsers]);

  async function assign(userId: string) {
    const brandId = selectedBrand[userId];
    if (!brandId) {
      setError("Pick a brand before assigning.");
      return;
    }
    await mutate(userId, { action: "assign", brandId });
  }

  async function revoke(userId: string) {
    await mutate(userId, { action: "revoke" });
  }

  async function mutate(userId: string, body: Record<string, unknown>) {
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed.");
      // Update the row in place
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: json.role, brandId: json.brand?.id ?? null, brand: json.brand ?? null }
            : u
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="min-h-screen bg-white pt-12 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878]">Platform</span>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Brand Manage</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-10">
        <div className="mb-8">
          <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black">Brand Manage</h1>
          <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-1">
            Search any account and grant or revoke brand-admin access. {brands.length} brands available.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mb-8">
          <label className={labelClass}>Search users</label>
          <input
            type="text"
            placeholder="Name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="font-[metropolis] text-[11px] text-red-600 tracking-wider mb-5">{error}</p>
        )}

        {/* Users list */}
        <div className="border border-black/8 divide-y divide-black/5">
          {loading && (
            <p className="px-7 py-10 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
              Loading…
            </p>
          )}
          {!loading && users.length === 0 && (
            <p className="px-7 py-10 text-center font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
              No users found
            </p>
          )}
          {!loading &&
            users.map((u) => {
              const isSuper = u.role === "SUPER_ADMIN";
              const isAdmin = u.role === "ADMIN";
              return (
                <div key={u.id} className="px-7 py-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-[metropolis] text-[13px] text-black truncate">{u.name || "—"}</p>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider mt-0.5 truncate">
                      {u.email}
                    </p>
                    {isAdmin && u.brand && (
                      <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-1">
                        Manages: <span className="text-black">{u.brand.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isSuper ? (
                    <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider italic">
                      Managed via env
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={selectedBrand[u.id] ?? u.brandId ?? ""}
                        onChange={(e) => setSelectedBrand((p) => ({ ...p, [u.id]: e.target.value }))}
                        className="border border-black/15 px-3 py-2.5 font-[metropolis] text-[11px] text-black bg-white outline-none focus:border-black/50 min-w-[160px]"
                      >
                        <option value="">Select brand…</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => assign(u.id)}
                        className="font-[metropolisSemiBold] text-[9px] tracking-[0.18em] uppercase text-white bg-black px-5 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-40"
                      >
                        {isAdmin ? "Reassign" : "Assign"}
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => revoke(u.id)}
                          className="font-[metropolis] text-[9px] tracking-[0.15em] uppercase text-[#787878] border border-black/15 px-4 py-2.5 hover:border-black hover:text-black transition-all disabled:opacity-40"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-5 leading-relaxed">
          Note: role changes take effect on the user&apos;s next login. Super-admins are controlled by the
          SUPER_ADMIN_EMAILS environment variable and cannot be changed here.
        </p>
      </div>
    </section>
  );
}
