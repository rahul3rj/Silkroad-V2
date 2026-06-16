"use client";

import Link from "next/link";

export default function VisionPage() {
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
          Vision
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-16">
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          Our Vision
        </h1>

        <div className="space-y-8">
          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              The Future of Luxury
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                At Silkroad, we envision a future where luxury is synonymous with sustainability and mindful consumption. We believe that true elegance lies not only in the final product but in the journey of its creation.
              </p>
              <p>
                Our commitment to the environment drives us to partner with brands that prioritize ethical sourcing, fair labor practices, and reduced carbon footprints. We are constantly exploring innovative ways to bring you the finest fashion without compromising the well-being of our planet.
              </p>
            </div>
          </div>

          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              A Global Community
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                We aim to build more than just a marketplace; we are cultivating a global community of tastemakers, creators, and connoisseurs. A space where ideas are exchanged, cultures are celebrated, and individual style is championed.
              </p>
              <p>
                Through exclusive events, editorial features, and interactive platforms, we want to inspire you to not only wear fashion but to understand and appreciate the art behind it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
