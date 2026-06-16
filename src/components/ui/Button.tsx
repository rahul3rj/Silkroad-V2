// UI Button component
// TODO: Add variants (primary, secondary, ghost, destructive) and size props
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded font-medium transition focus:outline-none";
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200",
    secondary: "border border-zinc-700 text-white hover:bg-zinc-800",
    ghost: "text-zinc-400 hover:text-white",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
