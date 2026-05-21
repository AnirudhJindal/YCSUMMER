"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridScan } from "@/components/ui/grid";

function RoughBorder({ id }: { id: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
        </filter>
      </defs>
      <rect
        x="2" y="2"
        width="calc(100% - 4px)" height="calc(100% - 4px)"
        fill="none" stroke="#1c1917" strokeWidth="1.7" rx="12"
        filter={`url(#${id})`}
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
    </svg>
  );
}

export default function Hero() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 100px 20px 48px !important; }
          .hero-right { width: 100% !important; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .hero-grid { padding: 120px 32px 64px !important; gap: 32px !important; }
        }
      `}</style>

      <section
        style={{ fontFamily: "var(--font-annie)" }}
        className="relative w-full min-h-screen overflow-hidden border-b-2 border-black"
      >
        {/* Grid */}
        <div className="absolute inset-0 z-0">
          <GridScan
            linesColor=""
            scanColor="#93c5fd"
            scanOpacity={0.4}
            gridScale={0.25}
            lineThickness={0.1}
            scanDirection="forward"
            scanDuration={1}
            scanDelay={2}
            scanGlow={1.2}
            scanSoftness={1.5}
            scanPhaseTaper={0.85}
            noiseIntensity={0.018}
            enablePost
            bloomIntensity={1}
            bloomThreshold={0.05}
            bloomSmoothing={0.2}
            chromaticAberration={0.002}
            scanOnClick
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/55 via-background/40 to-background/65 pointer-events-none" />

        {/* Content */}
        <div className="hero-grid relative z-20 grid md:grid-cols-2 gap-10 px-8 py-32 max-w-6xl mx-auto items-center min-h-screen">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs border border-blue-200 bg-blue-50/80 px-3 py-1 rounded-full inline-flex items-center gap-2 mb-6 text-blue-700 backdrop-blur-sm font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Early access open
            </div>

            <h1
              className="text-foreground mb-6"
              style={{ fontSize: "clamp(36px, 6vw, 80px)", letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              Your private data<br />
              never reaches<br />
              <span className="text-blue-900">LLM pipelines.</span>
            </h1>

            <p
              className="text-muted-foreground mb-8 max-w-sm"
              style={{ fontSize: "clamp(15px, 1.3vw, 18px)", lineHeight: 1.7, letterSpacing: "0.02em" }}
            >
              A privacy layer between your AI agents and any LLM. Sensitive fields
              masked before they leave your server — restored in the response.
            </p>

            <button
              onClick={() => router.push("/auth")}
              className="bg-blue-900 text-white px-6 py-3 rounded-md text-sm hover:bg-blue-800 transition-colors font-mono"
              style={{ touchAction: "manipulation" }}
            >
              Get started →
            </button>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-right space-y-4"
          >
            {/* Main Card */}
            <div className="relative rounded-xl p-4 bg-white/80 backdrop-blur-md shadow-sm">
              <RoughBorder id="main-card" />
              <div className="relative z-10">
                <p className="text-xs text-blue-500 mb-3 font-mono uppercase tracking-widest">
                  {step === 0 ? "Prompt before vault" : "Masked prompt"}
                </p>
                <div className="space-y-2 font-mono text-sm">
                  {[
                    { label: "name", raw: `"Sarah Chen"`, masked: "[NAME_0]" },
                    { label: "card", raw: `"4111 1111 1111 1111"`, masked: "[CARD_0]" },
                    { label: "amount", raw: `"$8,400"`, masked: "[AMOUNT_0]" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span>{item.label}</span>
                      <motion.span
                        key={step}
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        className={step === 0 ? "" : "text-blue-500 italic"}
                      >
                        {step === 0 ? item.raw : item.masked}
                      </motion.span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { raw: "3 fields", masked: "0 bytes", label: "PII" },
                { raw: "—", masked: "<2ms", label: "overhead" },
                { raw: "any", masked: "any", label: "LLM" },
              ].map((item) => (
                <div key={item.label} className="relative rounded-lg p-3 bg-white/70">
                  <RoughBorder id={`stat-${item.label}`} />
                  <div className="relative z-10 text-center">
                    <motion.div key={step} className="font-mono text-sm">
                      {step === 0 ? item.raw : item.masked}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}