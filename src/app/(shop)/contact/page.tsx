"use client";

import Link from "next/link";

export default function ContactPage() {
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
          Contact Us
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-16">
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          Get in Touch
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Client Services
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                Our dedicated Client Services team is available to assist you with any inquiries regarding our collections, sizing, orders, and delivery.
              </p>
              <div>
                <p className="font-[metropolisSemiBold] text-black mb-1">Email</p>
                <a href="mailto:clientservices@silkroad.com" className="hover:text-black transition-colors underline underline-offset-2">
                  clientservices@silkroad.com
                </a>
              </div>
              <div>
                <p className="font-[metropolisSemiBold] text-black mb-1">Phone</p>
                <a href="tel:+18001234567" className="hover:text-black transition-colors underline underline-offset-2">
                  +1 (800) 123-4567
                </a>
              </div>
              <p className="text-[11px] text-[#aaa]">
                Available Monday - Friday, 9:00 AM - 6:00 PM (EST)
              </p>
            </div>
          </div>

          <div className="border border-black/8 p-8 md:p-12 flex flex-col">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Press & Partnerships
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed flex-1">
              <p>
                For press inquiries, editorial requests, or potential partnerships, please contact our PR department.
              </p>
              <div>
                <p className="font-[metropolisSemiBold] text-black mb-1">Press Inquiries</p>
                <a href="mailto:press@silkroad.com" className="hover:text-black transition-colors underline underline-offset-2">
                  press@silkroad.com
                </a>
              </div>
              <div>
                <p className="font-[metropolisSemiBold] text-black mb-1">Partnerships</p>
                <a href="mailto:partners@silkroad.com" className="hover:text-black transition-colors underline underline-offset-2">
                  partners@silkroad.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
