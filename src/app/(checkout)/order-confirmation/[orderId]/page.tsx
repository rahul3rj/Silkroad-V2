// /order-confirmation/[orderId] — Order confirmed page
import Link from "next/link";

type Props = { params: Promise<{ orderId: string }> };

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;

  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          Order Confirmed
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-20 text-center">
        {/* ── Success Icon ── */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 border border-black/10 flex items-center justify-center relative">
            <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
              <path
                d="M2 11l7 7L24 2"
                stroke="black"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Heading ── */}
        <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.3em] uppercase text-[#787878] mb-3">
          Order Confirmed
        </p>
        <h1 className="font-[metropolis] text-[32px] tracking-[-0.01em] text-black mb-4">
          Thank you for your order.
        </h1>
        <p className="font-[metropolis] text-[12px] text-[#787878] tracking-wider leading-relaxed max-w-md mx-auto">
          A confirmation has been sent to your email address. We&apos;ll notify
          you once your order has been dispatched.
        </p>

        {/* ── Order ID block ── */}
        <div className="mt-10 border border-black/8 px-8 py-6 inline-block text-left w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#aaa] mb-1">
                Order Reference
              </p>
              <p className="font-[metropolisSemiBold] text-[13px] tracking-[0.08em] text-black">
                {orderId}
              </p>
            </div>
            <div className="w-[1px] h-10 bg-black/8 mx-6" />
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#aaa] mb-1">
                Estimated Delivery
              </p>
              <p className="font-[metropolis] text-[12px] tracking-wide text-black">
                5–7 Business Days
              </p>
            </div>
            <div className="w-[1px] h-10 bg-black/8 mx-6" />
            <div>
              <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#aaa] mb-1">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <p className="font-[metropolis] text-[12px] tracking-wide text-black">
                  Processing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── What's next ── */}
        <div className="mt-8 border border-black/8 px-8 py-6 text-left">
          <p className="font-[metropolisSemiBold] text-[10px] tracking-[0.22em] uppercase text-black mb-5 pb-4 border-b border-black/8">
            What happens next
          </p>
          <div className="space-y-5">
            {[
              {
                step: "01",
                title: "Order Processing",
                desc: "We're preparing your order and verifying payment.",
              },
              {
                step: "02",
                title: "Quality Check",
                desc: "Each item is carefully inspected before dispatch.",
              },
              {
                step: "03",
                title: "Dispatched",
                desc: "Your order ships with a tracking number sent to your email.",
              },
              {
                step: "04",
                title: "Delivered",
                desc: "Your order arrives at your door, beautifully packaged.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                <span className="font-[metropolisSemiBold] text-[10px] tracking-[0.15em] text-[#bbb] shrink-0 pt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="font-[metropolis] text-[12px] text-black tracking-wide">
                    {item.title}
                  </p>
                  <p className="font-[metropolis] text-[11px] text-[#787878] tracking-wider leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orders"
            className="px-10 py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="px-10 py-4 border border-black/15 text-black font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:border-black transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>

        {/* ── Support note ── */}
        <p className="mt-10 font-[metropolis] text-[10px] text-[#aaa] tracking-wider">
          Need help?{" "}
          <Link
            href="/"
            className="text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200"
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </main>
  );
}
