// (admin) layout — brand-scoped admin panel.
// The brand context now comes from the logged-in admin's session (set in auth.ts),
// not a hardcoded slug. Super-admins have no brand → shown as "Platform".
import AdminSidebar from "@/components/admin/AdminSidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";
  const brandName =
    session?.user?.brandName ?? (role === "SUPER_ADMIN" ? "Platform" : "Silkroad");
  const brandSlug = session?.user?.brandSlug ?? "";
  const userImage = session?.user?.image ?? null;

  return (
    <div className="min-h-screen flex bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto w-64 shrink-0 border-r border-black/8 pt-16">
        <AdminSidebar brandName={brandName} brandSlug={brandSlug} role={role} userImage={userImage} />
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
