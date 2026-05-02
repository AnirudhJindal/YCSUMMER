"use client";
import { Parallax } from "react-scroll-parallax";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CodeDemo from "@/components/CodeDemo";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-clip w-full">
      <Navbar />

      <Parallax translateY={[0, -15]} scale={[1, 1.15]}>
        <Hero />
      </Parallax>

      <CodeDemo />

      <Parallax translateY={[0, -15]} scale={[1, 1.5]}>
        <Features />
      </Parallax>

      <Parallax translateY={[0, -15]} scale={[1, 1]}>
        <CTA />
      </Parallax>

      <Footer />
    </main>
  );
}