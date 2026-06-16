"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AccountShell } from "@/components/account/AccountShell";

// ── Preferences skeleton ─────────────────────────────────────────────────────────────
function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border border-black/8 p-6 animate-pulse">
      {/* Section title */}
      <div className="h-2 bg-black/5 rounded w-32 mb-6 pb-4 border-b border-transparent" />
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-black/8 rounded w-32" />
              <div className="h-2 bg-black/4 rounded w-56" />
            </div>
            <div className="w-10 h-5 bg-black/6 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DisplaySkeleton() {
  return (
    <div className="border border-black/8 p-6 animate-pulse">
      <div className="h-2 bg-black/5 rounded w-40 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((n) => (
          <div key={n}>
            <div className="h-2 bg-black/5 rounded w-16 mb-2" />
            <div className="h-10 bg-black/5 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}


// ── localStorage key ──────────────────────────────────────────────────────────
const DISPLAY_KEY = "silkroad-display-prefs";

interface DisplayPrefs {
  currency: string;
  language: string;
  sizeGuide: string;
}

const DEFAULT_DISPLAY: DisplayPrefs = {
  currency:  "USD",
  language:  "en",
  sizeGuide: "UK",
};

function loadDisplayPrefs(): DisplayPrefs {
  if (typeof window === "undefined") return DEFAULT_DISPLAY;
  try {
    const raw = localStorage.getItem(DISPLAY_KEY);
    if (!raw) return DEFAULT_DISPLAY;
    return { ...DEFAULT_DISPLAY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DISPLAY;
  }
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0 ${
        checked ? "bg-black" : "bg-black/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-4 h-4 border flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5"
      style={{ background: checked ? "black" : "white", borderColor: checked ? "black" : "rgba(0,0,0,0.25)" }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/8 p-6">
      <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-5 pb-4 border-b border-black/8">
        {title}
      </p>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-8 cursor-pointer group">
      <div className="flex-1">
        <p className="font-[metropolis] text-[12px] text-black tracking-wide group-hover:opacity-70 transition-opacity duration-200">{label}</p>
        {description && <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider leading-relaxed mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </label>
  );
}

function CheckboxRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <Checkbox checked={checked} onChange={onChange} />
      <div>
        <p className="font-[metropolis] text-[12px] text-black tracking-wide group-hover:opacity-70 transition-opacity duration-200">{label}</p>
        {description && <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider leading-relaxed mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-300"
        onClick={!deleting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-md border border-black/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-black/8">
            <h3 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
              Delete Account
            </h3>
            <button
              onClick={onCancel}
              disabled={deleting}
              className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors duration-200 disabled:opacity-40"
              aria-label="Close"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <p className="font-[metropolis] text-[15px] text-black tracking-[-0.01em] mb-3">
              Are you sure you want to delete your account?
            </p>
            <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed">
              This will permanently remove your profile, order history, saved addresses, and all associated data. This action{" "}
              <span className="text-black font-[metropolisSemiBold]">cannot be undone</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center justify-between gap-4">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200 disabled:opacity-40"
            >
              Keep My Account
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-8 py-3.5 bg-red-600 text-white font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase hover:bg-red-700 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Deleting…
                </>
              ) : (
                "Yes, Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
  const router = useRouter();

  // Notifications
  const [notif, setNotif] = useState({
    orderUpdates:  true,
    newArrivals:   false,
    saleAlerts:    true,
    restockAlerts: false,
    weeklyEdit:    false,
  });

  // Communication channels
  const [channels, setChannels] = useState({
    email: true,
    sms:   false,
    push:  false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    personalisation: true,
    analytics:       true,
    thirdParty:      false,
  });

  // Display — loaded from localStorage on first render (no useEffect needed)
  const [display, setDisplay] = useState<DisplayPrefs>(() => {
    if (typeof window === "undefined") return DEFAULT_DISPLAY;
    return loadDisplayPrefs();
  });

  // mounted guard — ensures localStorage is only read after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Save display prefs to localStorage whenever they change
  useEffect(() => {
    if (mounted) localStorage.setItem(DISPLAY_KEY, JSON.stringify(display));
  }, [display, mounted]);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Display is already auto-saved via the useEffect above.
    // Notifications/privacy would be saved to DB here in a future step.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setDeleteError(json.error ?? "Failed to delete account.");
        setDeleting(false);
        return;
      }
      // Sign out and redirect to home — account no longer exists
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleting(false);
    }
  };

  const selectCls =
    "border border-black/15 px-3 py-2 font-[metropolis] text-[12px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white appearance-none pr-8 cursor-pointer";

  return (
    <AccountShell active="/profile/preferences" breadcrumb="Preferences" title="My Account">
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleting) setShowDeleteModal(false); }}
          deleting={deleting}
        />
      )}

      {/* Section header */}
      <div className="border-b border-black/8 pb-5 mb-8">
        <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black">
          Preferences
        </h2>
      </div>

      {/* Skeleton while hydrating */}
      {!mounted && (
        <div className="space-y-5">
          <SectionSkeleton rows={5} />
          <SectionSkeleton rows={3} />
          <DisplaySkeleton />
          <SectionSkeleton rows={3} />
          <SectionSkeleton rows={2} />
        </div>
      )}

      {/* Main content — hidden until hydrated */}
      {mounted && (
        <>
          {/* Save success banner */}
          {saved && (
            <div className="mb-6 flex items-center gap-3 bg-black text-white px-5 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-[metropolis] text-[11px] tracking-[0.12em] uppercase">
                Preferences saved successfully
              </span>
            </div>
          )}

          {/* Delete error banner */}
          {deleteError && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 px-5 py-3">
              <span className="font-[metropolis] text-[11px] text-red-700 tracking-wider">{deleteError}</span>
              <button onClick={() => setDeleteError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* ── Notifications ── */}
            <Section title="Email Notifications">
              <div className="space-y-5">
                <ToggleRow label="Order Updates" description="Shipping confirmations, delivery notifications, and tracking." checked={notif.orderUpdates} onChange={(v) => setNotif((n) => ({ ...n, orderUpdates: v }))} />
                <ToggleRow label="New Arrivals" description="Be first to see the latest drops from your favourite brands." checked={notif.newArrivals} onChange={(v) => setNotif((n) => ({ ...n, newArrivals: v }))} />
                <ToggleRow label="Sale & Promotions" description="Exclusive member discounts and seasonal sale alerts." checked={notif.saleAlerts} onChange={(v) => setNotif((n) => ({ ...n, saleAlerts: v }))} />
                <ToggleRow label="Back in Stock" description="Get notified when wishlisted items are available again." checked={notif.restockAlerts} onChange={(v) => setNotif((n) => ({ ...n, restockAlerts: v }))} />
                <ToggleRow label="The Weekly Edit" description="Curated selection of pieces, stories, and style notes." checked={notif.weeklyEdit} onChange={(v) => setNotif((n) => ({ ...n, weeklyEdit: v }))} />
              </div>
            </Section>

            {/* ── Channels ── */}
            <Section title="Communication Channels">
              <div className="space-y-4">
                <CheckboxRow label="Email" description="Receive communications to your registered email address." checked={channels.email} onChange={(v) => setChannels((c) => ({ ...c, email: v }))} />
                <CheckboxRow label="SMS" description="Text message notifications for orders and exclusive offers." checked={channels.sms} onChange={(v) => setChannels((c) => ({ ...c, sms: v }))} />
                <CheckboxRow label="Push Notifications" description="Browser or app push notifications for real-time updates." checked={channels.push} onChange={(v) => setChannels((c) => ({ ...c, push: v }))} />
              </div>
            </Section>

            {/* ── Display & Localisation — persisted to localStorage ── */}
            <Section title="Display & Localisation">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Currency — default USD */}
                <div>
                  <label className="block font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black mb-2">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      value={display.currency}
                      onChange={(e) => setDisplay((d) => ({ ...d, currency: e.target.value }))}
                      className={selectCls}
                    >
                      {["USD", "EUR", "GBP", "JPY", "AED", "SGD", "INR"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/40" width="9" height="5" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black mb-2">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={display.language}
                      onChange={(e) => setDisplay((d) => ({ ...d, language: e.target.value }))}
                      className={selectCls}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="it">Italiano</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                      <option value="ar">العربية</option>
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/40" width="9" height="5" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Size guide */}
                <div>
                  <label className="block font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black mb-2">
                    Size Guide
                  </label>
                  <div className="relative">
                    <select
                      value={display.sizeGuide}
                      onChange={(e) => setDisplay((d) => ({ ...d, sizeGuide: e.target.value }))}
                      className={selectCls}
                    >
                      {["UK", "EU", "US", "IT", "FR", "JP"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/40" width="9" height="5" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider mt-4">
                Display preferences are saved automatically to this browser.
              </p>
            </Section>

            {/* ── Privacy ── */}
            <Section title="Privacy & Data">
              <div className="space-y-5">
                <ToggleRow label="Personalisation" description="Allow Silkroad to personalise your browsing experience based on your activity." checked={privacy.personalisation} onChange={(v) => setPrivacy((p) => ({ ...p, personalisation: v }))} />
                <ToggleRow label="Analytics" description="Help us improve by allowing anonymised usage analytics." checked={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} />
                <ToggleRow label="Third-party Sharing" description="Allow Silkroad to share your data with trusted marketing partners." checked={privacy.thirdParty} onChange={(v) => setPrivacy((p) => ({ ...p, thirdParty: v }))} />
              </div>
            </Section>

            {/* ── Account actions ── */}
            <Section title="Account Actions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-[metropolis] text-[12px] text-black tracking-wide">Download My Data</p>
                    <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider mt-0.5">Request a copy of all personal data we hold.</p>
                  </div>
                  <button className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black border border-black/15 px-4 py-2 hover:border-black transition-colors duration-200 shrink-0">
                    Request
                  </button>
                </div>
                <div className="border-t border-black/5 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-[metropolis] text-[12px] text-red-600 tracking-wide">Delete Account</p>
                    <p className="font-[metropolis] text-[10px] text-[#aaa] tracking-wider mt-0.5">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-red-600 border border-red-200 px-4 py-2 hover:border-red-500 hover:bg-red-50 transition-all duration-200 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Save button */}
          <div className="pt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-12 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300"
            >
              Save Preferences
            </button>
          </div>
        </>
      )}
    </AccountShell>
  );
}
