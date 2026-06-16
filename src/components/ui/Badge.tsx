// UI Badge component — for labels like "New", "Sale", "Sold Out"
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sale" | "new" | "soldout";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    sale:    "bg-red-900 text-red-200",
    new:     "bg-emerald-900 text-emerald-200",
    soldout: "bg-zinc-700 text-zinc-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
