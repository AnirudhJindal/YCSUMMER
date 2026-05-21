"use client";
import { Parallax } from "react-scroll-parallax";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CodeDemo from "@/components/CodeDemo";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <main className="overflow-x-clip w-full">
      <Navbar />

      <Parallax translateY={[0, -15]} scale={[1, 1.15]}>
        <Hero />
      </Parallax>

      <CodeDemo />

      {/* No scale on mobile — it causes layout blowout */}
      <Parallax translateY={[0, -15]} scale={isMobile ? [1, 1] : [1, 1.5]}>
        <Features />
      </Parallax>

      <Parallax translateY={[0, -15]} scale={[1, 1]}>
        <CTA />
      </Parallax>

      <Footer />
    </main>
  );
}