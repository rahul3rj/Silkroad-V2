import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/common/SmoothScroll";
import LoaderWrapper from "./LoaderWrapper";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orion = localFont({
  src: "../../public/fonts/Orionprimedemo-1GrV4.ttf",
  variable: "--font-orion",
});

const metropolis = localFont({
  src: "../../public/fonts/metropolis/Metropolis-Regular.otf",
  variable: "--font-metropolis",
});

const metropolisLight = localFont({
  src: "../../public/fonts/metropolis/Metropolis-Light.otf",
  variable: "--font-metropolis-light",
});

const royal = localFont({
  src: "../../public/fonts/Royal Calypso.ttf",
  variable: "--font-royal",
});

const metropolisSemiBold = localFont({
  src: "../../public/fonts/metropolis/Metropolis-SemiBold.otf",
  variable: "--font-metropolis-semiBold",
});

export const metadata: Metadata = {
  title: "SilkRoad",
  description: "A place we sell premium experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${orion.variable} ${royal.variable} ${metropolis.variable} ${metropolisSemiBold.variable} ${metropolisLight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SmoothScroll />
          <LoaderWrapper>{children}</LoaderWrapper>
        </Providers>
      </body>
    </html>
  );
}
