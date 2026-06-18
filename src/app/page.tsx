"use client";

import { Navbar } from "@/components/layout/Navbar";
import { BackgroundSlider } from "@/components/ui/BackgroundSlider";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import type { ProductData } from "@/types/product";

interface CreationCardProps {
  index: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  href: string;
}

function CreationCard({
  index,
  title,
  subtitle,
  imageSrc,
  href,
}: CreationCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const text = textRef.current;
    if (!card || !text) return;

    const handleScroll = () => {
      const rect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const cardHeight = rect.height;

      const visibleHeight = viewportHeight - rect.top;

      const startThreshold = cardHeight * 0.25;
      const endThreshold = cardHeight * 0.5;

      if (visibleHeight < startThreshold) {
        text.style.opacity = "0";
        text.style.filter = "blur(16px)";
        text.style.transform = "translateY(40px)";
      } else if (visibleHeight >= endThreshold) {
        text.style.opacity = "1";
        text.style.filter = "blur(0px)";
        text.style.transform = "none";
      } else {
        const progress =
          (visibleHeight - startThreshold) / (endThreshold - startThreshold);
        text.style.opacity = `${progress}`;
        text.style.filter = `blur(${(1 - progress) * 16}px)`;
        text.style.transform = `translateY(${(1 - progress) * 40}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={href}
      /* Mobile: full-width tall card. Desktop: 32.5% wide side-by-side */
      className="w-full h-[55vw] md:h-full md:w-[32.5%] relative group cursor-pointer block flex-shrink-0"
    >
      {/* Image container */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          src={imageSrc}
          alt={title}
        />
        <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/[0.07] transition-colors duration-[1200ms] z-10" />
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end mix-blend-difference text-white">
        <div
          ref={textRef}
          className="sticky bottom-16 flex flex-col items-center text-center w-full pb-8 md:pb-10"
          style={{ willChange: "transform, opacity, filter" }}
        >
          <span className="font-[royal] text-xl md:text-3xl tracking-wide opacity-90 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
            {subtitle}
          </span>
          <h3 className="font-[metropolis] text-base md:text-2xl tracking-wide leading-tight mt-1 mb-3 md:mb-4 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] origin-center">
            {title}
          </h3>
          <div className="flex items-center mt-1 pointer-events-auto">
            <span className="font-[metropolisSemiBold] text-[10px] md:text-xs tracking-[0.15em] text-white awwwards-underline transition-all duration-500 group-hover:tracking-[0.2em]">
              Discover more
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  useEffect(() => {
    fetch("/api/products?random=true&limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProductData[]) => setFeaturedProducts(data))
      .catch(() => setFeaturedProducts([]));
  }, []);

  const row1 = featuredProducts.slice(0, 4);
  const row2 = featuredProducts.slice(4, 8);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => console.log(err));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Custom cursor — desktop only (skip on touch devices)
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let active = false;
    let hoveredTarget: HTMLElement | null = null;
    let currentAngle = 0;
    let currentSpeed = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const target = (e.target as HTMLElement).closest("[data-custom-cursor]") as HTMLElement | null;
      hoveredTarget = target;
    };
    const handleMouseLeave = () => { hoveredTarget = null; };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let animationId: number;
    const updateCursor = () => {
      if (hoveredTarget) {
        const text = hoveredTarget.getAttribute("data-custom-cursor") || "";
        const textSpan = cursor.querySelector(".cursor-text");
        if (textSpan && textSpan.textContent !== text) textSpan.textContent = text;
        if (!active) {
          active = true;
          pos.x = mouse.x;
          pos.y = mouse.y;
          cursor.style.opacity = "1";
          cursor.style.scale = "1";
        }
      } else {
        if (active) {
          active = false;
          cursor.style.opacity = "0";
          cursor.style.scale = "0";
        }
      }

      if (active) {
        const lerpFactor = 0.08;
        const dx = mouse.x - pos.x;
        const dy = mouse.y - pos.y;
        pos.x += dx * lerpFactor;
        pos.y += dy * lerpFactor;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1.5) {
          const targetAngle = Math.atan2(dy, dx);
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          currentAngle += angleDiff * 0.12;
        }

        const targetSpeed = Math.min(dist * 0.005, 0.35);
        currentSpeed += (targetSpeed - currentSpeed) * 0.08;
        const scaleX = 1 + currentSpeed;
        const scaleY = 1 - currentSpeed * 0.85;

        cursor.style.left = `${pos.x}px`;
        cursor.style.top = `${pos.y}px`;

        const dot = cursor.querySelector(".cursor-dot") as HTMLDivElement;
        if (dot) dot.style.transform = `rotate(${currentAngle}rad) scale(${scaleX}, ${scaleY})`;
      }

      animationId = requestAnimationFrame(updateCursor);
    };
    updateCursor();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <main className="min-h-screen w-full text-white flex flex-col relative">
      <Navbar />

      {/* ── 1st: Hero / Landing ─────────────────────────────────────────────── */}
      <div className="h-screen w-full flex justify-center items-center">
        <BackgroundSlider />
      </div>

      {/* ── 2nd: Discover the Collection (3 cards) ──────────────────────────── */}
      <div className="w-full bg-white flex flex-col justify-start items-center px-4 md:px-10 py-10 md:py-0 md:h-[120vh]">
        {/* Section header */}
        <div className="h-auto md:h-[20vh] w-full flex justify-center items-center relative py-8 md:py-0">
          <h2 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0">
            [ 01 ]
          </h2>
          <h2 className="text-black font-[metropolis] text-lg md:text-xl w-full md:w-[25%] text-center leading-snug">
            Explore a Selection of the Maison&apos;s Creations
          </h2>
        </div>

        {/* Cards — vertical stack on mobile, horizontal row on desktop */}
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 md:h-[100vh] md:pb-12">
          <CreationCard
            index="01"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="https://i.pinimg.com/1200x/86/56/7b/86567b88287510b3cba6b2e9e226e760.jpg"
            href="/women"
          />
          <CreationCard
            index="02"
            title="Silkroad Resort Collection"
            subtitle="Men"
            imageSrc="https://i.pinimg.com/1200x/0a/e0/d3/0ae0d3147a2eacd968f910aacd2e489f.jpg"
            href="/men"
          />
          <CreationCard
            index="03"
            title="Silkroad Resort Collection"
            subtitle="Accessories"
            imageSrc="https://i.pinimg.com/1200x/12/6e/81/126e81fdc2dfcd8f63bab2fcfa2b5ad1.jpg"
            href="/accessories"
          />
        </div>
      </div>

      {/* ── 3rd: Men's Fashion editorial ────────────────────────────────────── */}
      <div className="w-full bg-white flex justify-center items-center px-4 md:px-10 py-12 md:h-[130vh]">
        {/* Mobile: stack vertically. Desktop: side-by-side 60/38 */}
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center md:h-[100vh] gap-6 md:gap-0">

          {/* Big hero image */}
          <Link
            href="/men"
            className="w-full md:w-[60%] h-[60vw] md:h-full flex justify-center items-end overflow-hidden md:cursor-none"
            data-custom-cursor="VIEW"
          >
            <img
              src="https://i.pinimg.com/1200x/bb/60/af/bb60af7e5818e11db98cbd4385436f8d.jpg"
              alt="Men's Fashion"
              className="h-full w-full object-cover hover:scale-103 transition-all duration-500"
            />
          </Link>

          {/* Right column */}
          <div className="w-full md:w-[38%] flex flex-col justify-between gap-4 md:gap-0 md:h-full">
            {/* Small secondary image */}
            <Link
              href="/men"
              className="w-full h-[50vw] md:h-[50vh] flex items-center overflow-hidden md:cursor-none"
              data-custom-cursor="VIEW"
            >
              <img
                src="https://i.pinimg.com/1200x/23/b8/ab/23b8ab050ead93f7e906cfa7e7064230.jpg"
                alt="Men's Look"
                className="h-full w-full object-cover object-[0%_15%] hover:scale-105 transition-all duration-500"
              />
            </Link>

            {/* Label row */}
            <div className="w-full flex justify-between items-center text-black">
              <span className="font-[royal] text-3xl md:text-5xl text-[#787878] italic tracking-wide select-none">
                Men&apos;s Fashion
              </span>
              <span className="font-[metropolisSemiBold] text-xs text-[#787878] tracking-widest select-none">
                [ 02 ]
              </span>
            </div>

            {/* Copy */}
            <div className="w-full flex flex-col justify-end text-left">
              <p className="font-[metropolis] text-[#787878] text-[12px] md:text-[14px] leading-relaxed tracking-wide select-none text-justify">
                Our Work Knows No Borders. We At Editors At Work Are Available
                24/7 And Committed To Delivering High-Quality Video Content, No
                Matter Where You Are. Whether You&apos;re In New York, Mumbai, Or
                Melbourne, Our Team Works Across Time Zones To Ensure Your
                Deadlines Are Met And Your Vision Comes To Life Without
                Compromise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4th: Featured Products ───────────────────────────────────────────── */}
      <div className="w-full bg-white flex flex-col justify-between items-center px-4 md:px-10 pb-16 pt-10 md:h-[210vh] relative">
        {/* Title */}
        <div className="h-auto md:h-[20vh] w-full flex justify-center items-center relative py-6 md:py-0">
          <h2 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0 select-none">
            [ 03 ]
          </h2>
          <h2 className="text-black font-[metropolis] text-lg md:text-xl text-center leading-tight select-none">
            Best picks for you by Silkroad
          </h2>
        </div>

        {/* Product grid — 2 cols mobile, 4 cols desktop */}
        <div className="w-full flex flex-col gap-8 md:gap-16 justify-center flex-grow">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {row1.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {row2.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Discover button */}
        <div className="h-auto md:h-[10vh] w-full flex justify-center items-center mt-10 md:mt-8">
          <Link
            href="/new-in"
            className="premium-pill-btn group/btn relative overflow-hidden select-none text-center"
          >
            <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
            <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
              <div className="relative overflow-hidden h-full flex flex-col justify-start">
                <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">
                  Discover the Collection
                </span>
                <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">
                  Discover the Collection
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 5th: Women's Fashion video ──────────────────────────────────────── */}
      <div className="h-screen w-full flex justify-center items-center">
        <div
          onClick={handleVideoClick}
          data-custom-cursor={isPlaying ? "PAUSE" : "PLAY"}
          className="w-full h-full flex items-center justify-center relative overflow-hidden group/video md:cursor-none cursor-pointer"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            autoPlay
            muted
            loop
            src="/womens.mp4"
            playsInline
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/20 z-10 flex flex-col justify-between px-6 md:px-10 py-10 mix-blend-difference pointer-events-none">
            <h2 className="text-white font-[metropolisSemiBold] text-xs">
              [ 04 ]
            </h2>
            <div className="text-white text-center w-full mx-auto">
              <h2 className="text-4xl md:text-6xl font-[royal] mb-3 md:mb-4">
                Women&apos;s Fashion
              </h2>
              <p className="text-xs md:text-sm font-[metropolis] leading-relaxed mx-auto opacity-90 max-w-xs md:max-w-none">
                Our work knows no borders. We at Editors At Work are available
                24/7 and committed to delivering high-quality video content, no
                matter where you are. Whether you&apos;re in New York, Mumbai, or
                Melbourne, our team works across time zones to ensure your
                deadlines are met and your vision comes to life without
                compromise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6th: More collections (3 cards) ─────────────────────────────────── */}
      <div className="w-full bg-white flex flex-col justify-start items-center px-4 md:px-10 py-10 md:py-0 md:h-[120vh]">
        <div className="h-auto md:h-[20vh] w-full flex justify-center items-center relative py-8 md:py-0">
          <h2 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0">
            [ 05 ]
          </h2>
          <h2 className="text-black font-[metropolis] text-lg md:text-xl w-full md:w-[25%] text-center leading-snug">
            Explore a Selection of the Silkroad&apos;s Creations
          </h2>
        </div>
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 md:h-[100vh] md:pb-12">
          <CreationCard
            index="01"
            title="Silkroad Balenciaga Collection"
            subtitle="Women"
            imageSrc="https://i.pinimg.com/1200x/a7/27/8f/a7278f13e7839cd812a69a2e1cb33e74.jpg"
            href="/women"
          />
          <CreationCard
            index="02"
            title="Silkroad Louis Vuitton Collection"
            subtitle="Men"
            imageSrc="https://i.pinimg.com/1200x/85/a7/ed/85a7edfd9c2f9edd33824745ceff2e18.jpg"
            href="/men"
          />
          <CreationCard
            index="03"
            title="Silkroad Saint Laurent Collection"
            subtitle="Accessories"
            imageSrc="https://i.pinimg.com/1200x/1c/4a/bb/1c4abbf2ddb4772d0d1266bea393a39f.jpg"
            href="/accessories"
          />
        </div>
      </div>

      {/* ── 7th: Footer ─────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── Custom Water Blob Cursor — hidden on touch devices ──────────────── */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] opacity-0 scale-0 items-center justify-center w-24 h-24 mix-blend-difference hidden md:flex"
        style={{
          left: "-150px",
          top: "-150px",
          transform: "translate(-50%, -50%)",
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), scale 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="cursor-dot absolute w-20 h-20 bg-white mix-blend-difference rounded-full transition-transform duration-100 ease-out will-change-transform" />
        <span className="cursor-text absolute z-40 font-[metropolisSemiBold] text-[10px] tracking-[0.2em] text-white mix-blend-difference uppercase select-none font-semibold pl-[0.2em]" />
      </div>
    </main>
  );
}
