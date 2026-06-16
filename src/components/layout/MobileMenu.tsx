"use client";

// MobileMenu — slide-out navigation for small screens
// TODO: Implement with framer-motion slide animation and focus trap
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <nav className="w-72 bg-zinc-950 h-full p-6 flex flex-col gap-6 text-white">
        <button onClick={onClose} className="self-end text-zinc-500 hover:text-white">✕</button>
        {/* TODO: Nav links */}
      </nav>
    </div>
  );
}
