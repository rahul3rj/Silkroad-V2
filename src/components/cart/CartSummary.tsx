// CartSummary — subtotal, shipping, and checkout CTA
// TODO: Calculate totals from cart state, show free shipping threshold
import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const shipping = subtotal >= 150 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
      <div className="flex justify-between text-zinc-400">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-zinc-400">
        <span>Shipping</span>
        <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between text-white font-semibold pt-2 border-t border-zinc-800">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <Link
        href="/checkout"
        className="block w-full mt-4 bg-white text-black text-center py-3 rounded font-medium hover:bg-zinc-200 transition"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
