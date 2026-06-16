import { Navbar } from "@/components/layout/Navbar";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
