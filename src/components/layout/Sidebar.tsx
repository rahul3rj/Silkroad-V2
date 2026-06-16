// Sidebar — reusable sidebar panel (used in account + admin layouts)
// TODO: Extend with active link highlighting and collapse support
interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen border-r border-zinc-800 bg-zinc-950 p-6">
      {children}
    </aside>
  );
}
