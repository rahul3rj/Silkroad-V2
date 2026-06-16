"use client";

import Link from "next/link";

export default function AboutPage() {
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
          About Us
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-16">
        <h1 className="font-[metropolis] text-[28px] tracking-[-0.01em] text-black mb-10">
          About Silkroad
        </h1>

        <div className="space-y-8">
          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Our Heritage
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                Founded on the principles of timeless elegance and uncompromised quality, Silkroad has always been more than just a destination for luxury fashion. It is a curated experience designed for those who appreciate the finer details in life.
              </p>
              <p>
                Our journey began with a simple yet ambitious goal: to bridge the gap between classic craftsmanship and modern aesthetics. We travel the globe to source pieces that speak a universal language of style, ensuring that every item in our collection is a testament to superior artistry.
              </p>
            </div>
          </div>

          <div className="border border-black/8 p-8 md:p-12">
            <h2 className="font-[metropolisSemiBold] text-[11px] tracking-[0.22em] uppercase text-black mb-6 pb-4 border-b border-black/8">
              Our Curation
            </h2>
            <div className="space-y-5 font-[metropolis] text-[13px] text-[#555] tracking-wide leading-relaxed">
              <p>
                Every brand featured on Silkroad undergoes a rigorous selection process. We look beyond the label, focusing on the story, the materials, and the passion that goes into creating each piece. From established fashion houses to emerging avant-garde designers, our portfolio is as diverse as it is exclusive.
              </p>
              <p>
                We believe that luxury should not be defined by price alone, but by the value it brings to your personal expression. Whether it&apos;s a perfectly tailored suit or an artisanal leather bag, our collections are curated to elevate your everyday wardrobe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
