"use client";

import Link from "next/link";

export default function DeliveryAndReturnsPage() {
  return (
    <main className="min-h-screen bg-white pt-20 pb-24 page-content-enter">
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
          Delivery & Returns
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-16">
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          Delivery & Returns
        </h1>

        <div className="space-y-8">
          {/* Delivery Policy */}
          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Delivery Procedure
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                At Silkroad, we are committed to ensuring your luxury items reach you securely and promptly. We partner with premium courier services to deliver worldwide. All orders are processed within 1-2 business days.
              </p>
              
              <div>
                <strong className="text-black font-[metropolisSemiBold]">Standard Delivery:</strong>
                <p className="mt-1">
                  Complimentary for orders over $150. Delivery takes 3-5 business days depending on your location. A flat rate of $9.99 applies for orders under the threshold.
                </p>
              </div>

              <div>
                <strong className="text-black font-[metropolisSemiBold]">Express Delivery:</strong>
                <p className="mt-1">
                  Available for $25.00. Expect delivery within 1-2 business days. Orders must be placed before 2 PM local time for same-day dispatch.
                </p>
              </div>

              <p>
                Once your order has been dispatched, you will receive a confirmation email containing your tracking information, allowing you to monitor the progress of your delivery in real-time. All packages are fully insured during transit until they are successfully delivered and signed for.
              </p>
            </div>
          </div>

          {/* Return Policy */}
          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Return Policy
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                We want you to be completely satisfied with your purchase. If for any reason you are not, we offer a complimentary return service within 14 days of delivery.
              </p>
              
              <div>
                <strong className="text-black font-[metropolisSemiBold]">Conditions for Return:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Items must be returned in their original, unused, unwashed condition.</li>
                  <li>All original tags, authenticity cards, and branded packaging (including dust bags and shoe boxes) must be intact.</li>
                  <li>Footwear must be tried on a soft carpeted surface to avoid sole markings.</li>
                  <li>Beauty products, fragrances, and intimate apparel are final sale and cannot be returned for hygiene reasons.</li>
                </ul>
              </div>

              <div>
                <strong className="text-black font-[metropolisSemiBold]">How to Initiate a Return:</strong>
                <p className="mt-1">
                  1. Visit your account dashboard and select the order you wish to return. <br />
                  2. Generate and print the prepaid return label. <br />
                  3. Securely pack your items in the original shipping box. <br />
                  4. Attach the return label and drop it off at your nearest authorized courier location, or schedule a complimentary pickup.
                </p>
              </div>

              <p>
                Refunds are processed within 5-7 business days of receiving the returned item at our facility. The funds will be credited back to your original payment method. Please note that original shipping fees are non-refundable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
