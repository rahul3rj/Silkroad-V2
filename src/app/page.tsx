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

      // Calculate how much of the card has entered the viewport from the bottom
      const visibleHeight = viewportHeight - rect.top;

      // Thresholds: Starts appearing at 25% in, fully sharp and aligned at 50% in
      const startThreshold = cardHeight * 0.25;
      const endThreshold = cardHeight * 0.5;

      if (visibleHeight < startThreshold) {
        // Below 25%: hidden, blurry, and translated down
        text.style.opacity = "0";
        text.style.filter = "blur(16px)";
        text.style.transform = "translateY(40px)";
      } else if (visibleHeight >= endThreshold) {
        // Above 50%: fully visible, sharp, and transform cleared for perfect sticky behavior
        text.style.opacity = "1";
        text.style.filter = "blur(0px)";
        text.style.transform = "none";
      } else {
        // Between 25% and 50%: smoothly interpolate progress
        const progress =
          (visibleHeight - startThreshold) / (endThreshold - startThreshold);

        const opacity = progress;
        const blur = (1 - progress) * 16;
        const translateY = (1 - progress) * 40;

        text.style.opacity = `${opacity}`;
        text.style.filter = `blur(${blur}px)`;
        text.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial call to set correct positions
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
      className="h-full w-[32.5%] relative group cursor-pointer block"
    >
      {/* Image container with overflow-hidden for scaling clip */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          src={imageSrc}
          alt={title}
        />
        {/* Subtle overlay to enhance contrast */}
        <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/[0.07] transition-colors duration-[1200ms] z-10" />
      </div>

      {/* Sticky Text Overlay Container */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end mix-blend-difference text-white">
        {/* Pinned sticky element */}
        <div
          ref={textRef}
          className="sticky bottom-16 flex flex-col items-center text-center w-full pb-10"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* Subtitle: 'Women' in cursive royal font */}
          <span className="font-[royal] text-2xl md:text-3xl tracking-wide opacity-90 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
            {subtitle}
          </span>

          {/* Title: 'Silkroad Resort Collection' */}
          <h3 className="font-[metropolis] text-xl md:text-2xl tracking-wide leading-tight mt-1 mb-4 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] origin-center">
            {title}
          </h3>

          {/* CTA: 'Discover more' with sliding underline */}
          <div className="flex items-center mt-1 pointer-events-auto">
            <span className="font-[metropolisSemiBold] text-[11px] md:text-xs tracking-[0.15em] text-white awwwards-underline transition-all duration-500 group-hover:tracking-[0.2em]">
              Discover more
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ProductCard is now imported from @/components/product/ProductCard

export default function Home() {
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // 8 random products fetched from the DB — reshuffled on each page load
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

  useEffect(() => {
    const container = videoSectionRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;

    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let active = false;

    // Direct physics tracking for angle and velocity smoothing
    let currentAngle = 0;
    let currentSpeed = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      active = true;
      cursor.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      active = false;
      cursor.style.opacity = "0";
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseenter", handleMouseEnter, {
      passive: true,
    });
    container.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });

    let animationId: number;

    const updateCursor = () => {
      if (active) {
        const lerpFactor = 0.08; // smooth inertia heavy cursor
        const dx = mouse.x - pos.x;
        const dy = mouse.y - pos.y;

        pos.x += dx * lerpFactor;
        pos.y += dy * lerpFactor;

        const dist = Math.sqrt(dx * dx + dy * dy);

        // 1. Stabilize and interpolate the rotation angle (prevents sub-pixel quadrant jumping)
        if (dist > 1.5) {
          const targetAngle = Math.atan2(dy, dx);

          // Keep rotation smooth around the -PI / PI loop boundary (shortest path angle lerp)
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          currentAngle += angleDiff * 0.12; // slow rot lerp removes all jitter
        }

        // 2. Interpolate the speed/stretching factor (delays distortion until direction is established)
        const targetSpeed = Math.min(dist * 0.005, 0.35);
        currentSpeed += (targetSpeed - currentSpeed) * 0.08; // inertia delay on the squishy blob deformation

        // 3. Compute volume-preserved scale matrix
        const scaleX = 1 + currentSpeed;
        const scaleY = 1 - currentSpeed * 0.85;

        cursor.style.left = `${pos.x}px`;
        cursor.style.top = `${pos.y}px`;

        const dot = cursor.querySelector(".cursor-dot") as HTMLDivElement;
        if (dot) {
          dot.style.transform = `rotate(${currentAngle}rad) scale(${scaleX}, ${scaleY})`;
        }
      }

      animationId = requestAnimationFrame(updateCursor);
    };

    updateCursor();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <main className="min-h-screen w-full text-white flex flex-col relative">
      <Navbar />
      {/* 1st Page: Landing Page */}
      <div className="h-screen w-full flex justify-center items-center">
        <BackgroundSlider />
      </div>
      {/* 2nd Page: Discover the Collection */}
      <div className="h-[120vh] w-full bg-white flex flex-col justify-start items-center px-10">
        <div className="h-[20vh] w-full flex justify-center items-center relative">
          <h1 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0">
            [ 01 ]
          </h1>
          <h1 className="text-black font-[metropolis] text-xl w-[25%] text-center">
            Explore a Selection of the Maison&apos;s Creations
          </h1>
        </div>
        <div className="h-[100vh] w-full flex justify-between items-center pb-12">
          <CreationCard
            index="01"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/cc1.png"
            href="/women"
          />
          <CreationCard
            index="02"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/cc2.png"
            href="/men"
          />
          <CreationCard
            index="03"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/cc3.png"
            href="/bags"
          />
        </div>
      </div>
      {/* 3rd Page: Men&apos;s Fashion */}
      <div className="h-[130vh] w-full bg-white flex justify-center items-center px-10">
        <div className="w-full h-[100vh] flex justify-between items-center">
          <div className="w-[60%] h-full flex justify-center items-end">
            <img
              src="images/ds1.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="w-[38%] h-full flex flex-col justify-between ">
            {/* Top Section: Category, Price, and Color Palette Selection */}
            <div className="w-full flex flex-col justify-start">
              <div className="w-full flex justify-between items-center text-black font-[metropolis]">
                <span className="text-sm font-[metropolisSemiBold] uppercase tracking-widest text-black">
                  Men&apos;s Fashion
                </span>
                <span className="text-sm font-[metropolisSemiBold] tracking-widest text-black">
                  $499
                </span>
              </div>
              <div className="flex gap-3 mt-4">
                <span className="w-3.5 h-3.5 rounded-full bg-[#8B0000] cursor-pointer hover:scale-115 transition-all duration-300 ring-offset-2 hover:ring-2 hover:ring-[#8B0000]/30 shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#0f766e] cursor-pointer hover:scale-115 transition-all duration-300 ring-offset-2 hover:ring-2 hover:ring-[#0f766e]/30 shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#1e293b] cursor-pointer hover:scale-115 transition-all duration-300 ring-offset-2 hover:ring-2 hover:ring-[#1e293b]/30 shadow-sm" />
              </div>
            </div>

            {/* Middle Section: Cursive script label and indicator */}
            <div className="w-full flex justify-between items-center text-black">
              <span className="font-[royal] text-4xl md:text-5xl text-[#787878] italic tracking-wide select-none">
                Men&apos;s Fashion
              </span>
              <span className="font-[metropolisSemiBold] text-xs text-[#787878] tracking-widest select-none">
                [ 02 ]
              </span>
            </div>

            {/* Bottom Section: Editorial copywriting */}
            <div className="w-full flex flex-col justify-end text-left">
              <p className="font-[metropolis] text-[#787878] text-[13px] md:text-[14px] leading-relaxed tracking-wide select-none text-justify">
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
      {/* 4th Page: Products */}
      <div className="h-[210vh] w-full bg-white flex flex-col justify-between items-center px-10 pb-16 relative">
        {/* Title Block */}
        <div className="h-[20vh] w-full flex justify-center items-center relative">
          <h1 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0 select-none">
            [ 03 ]
          </h1>
          <h1 className="text-black font-[metropolis] text-xl text-center leading-tight select-none">
            Explore a Selection of the Maison&apos;s
            <br />
            Creations
          </h1>
        </div>

        {/* Product Grid Rows — 8 random products from DB */}
        <div className="w-full flex flex-col gap-16 justify-center flex-grow">
          {/* Row 1 */}
          <div className="w-full grid grid-cols-4 gap-5">
            {row1.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* Row 2 */}
          <div className="w-full grid grid-cols-4 gap-5">
            {row2.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Discover Button at the very bottom */}
        <div className="h-[10vh] w-full flex justify-center items-center mt-8">
          <Link
            href="/new-in"
            className="premium-pill-btn group/btn relative overflow-hidden select-none text-center"
          >
            {/* The Curtain Background Slide Up */}
            <div className="absolute inset-0 bg-black origin-bottom scale-y-0 group-hover/btn:scale-y-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />

            {/* The Text Wrapper (mix-blend-difference inverts color to white when black curtain slides up) */}
            <div className="relative z-10 pointer-events-none mix-blend-difference text-white flex justify-center items-center overflow-hidden h-[22px]">
              {/* Rolling text animation container */}
              <div className="relative overflow-hidden h-full flex flex-col justify-start">
                {/* Normal Text (translates upwards) */}
                <span className="block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">
                  Discover the Collection
                </span>
                {/* Rolled Text (translates from below) */}
                <span className="absolute left-0 top-0 block transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover/btn:translate-y-0">
                  Discover the Collection
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* 5th Page: WoMen&apos;s Fashion with Custom Water Blob Cursor */}
      <div className="h-screen w-full flex justify-center items-center">
        <div
          ref={videoSectionRef}
          onClick={handleVideoClick}
          className="w-full h-full flex items-center justify-center relative overflow-hidden group/video cursor-none"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            autoPlay
            muted
            loop
            src="/womens.mp4"
          ></video>

          {/* Custom Awwwards-style Water Blob Cursor */}
          <div
            ref={cursorRef}
            className="absolute pointer-events-none z-30 opacity-0 transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-24 h-24 mix-blend-difference"
            style={{ left: "-150px", top: "-150px" }}
          >
            {/* The Water Blob Dot (Background deforming layer) */}
            <div className="cursor-dot absolute w-20 h-20 bg-white mix-blend-difference rounded-full transition-transform duration-100 ease-out will-change-transform" />

            {/* The Play/Pause Text (Centered stable overlay inside the blob) */}
            <span className="absolute z-40 font-[metropolisSemiBold] text-[10px] tracking-[0.2em] text-white mix-blend-difference uppercase select-none font-semibold pl-[0.2em]">
              {isPlaying ? "PAUSE" : "PLAY"}
            </span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/20 z-10 flex flex-col justify-between px-10 py-10 mix-blend-difference pointer-events-none">
            <h1 className="text-white font-[metropolisSemiBold] text-xs ">
              [ 04 ]
            </h1>
            <div className="text-white text-center w-full mx-auto">
              <h1 className="text-5xl md:text-6xl font-[royal] mb-4">
                WoMen&apos;s Fashion
              </h1>
              <h1 className="text-sm font-[metropolis] leading-relaxed mx-auto opacity-90">
                Our work knows no borders. We at Editors At Work are available
                24/7 and committed to delivering high-quality video content, no
                matter where you are. Whether you’re in New York, Mumbai, or
                Melbourne, our team works across time zones to ensure your
                deadlines are met and your vision comes to life without
                compromise.
              </h1>
            </div>
          </div>
        </div>
      </div>
      {/* 6th Page: Discover more collections */}
      <div className="h-[120vh] w-full bg-white flex flex-col justify-start items-center px-10">
        <div className="h-[20vh] w-full flex justify-center items-center relative">
          <h1 className="text-[#787878] font-[metropolisSemiBold] text-xs absolute left-0">
            [ 01 ]
          </h1>
          <h1 className="text-black font-[metropolis] text-xl w-[25%] text-center">
            Explore a Selection of the Maison&apos;s Creations
          </h1>
        </div>
        <div className="h-[100vh] w-full flex justify-between items-center pb-12">
          <CreationCard
            index="01"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/pp2.png"
            href="/women"
          />
          <CreationCard
            index="02"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/pp7.png"
            href="/men"
          />
          <CreationCard
            index="03"
            title="Silkroad Resort Collection"
            subtitle="Women"
            imageSrc="images/pp3.png"
            href="/bags"
          />
        </div>
      </div>
      {/* 7th page: Footer */}
      <Footer />
    </main>
  );
}
