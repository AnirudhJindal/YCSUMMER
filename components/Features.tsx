"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const fields = [
  { key: "name", raw: '"John Doe"', masked: "[NAME_0]" },
  { key: "card", raw: '"4111 1111 1111 1111"', masked: "[CARD_0]" },
  { key: "amount", raw: '"$9,400"', masked: "[AMOUNT_0]" },
  { key: "email", raw: '"john@acme.com"', masked: "[EMAIL_0]" },
  { key: "ip", raw: '"192.168.1.1"', masked: "[IP_0]" },
];

const bullets = [
  "Field-level masking — only what's sensitive gets replaced",
  "PII detected automatically — no config needed",
  "Audit logs on every masked field",
  "Works with structured and unstructured prompts",
];

function RoughBorder({ id, stroke = "#1c1917" }: { id: string; stroke?: string }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <filter id={id}>
          <feTurbulence baseFrequency="0.03" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>
      <rect x="2" y="2" style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }} fill="none" stroke={stroke} strokeWidth="2.2" rx="10" filter={`url(#${id})`} />
    </svg>
  );
}

export default function Features() {
  const ref = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s === 0 ? 1 : 0));
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0px", "45px"]);

  return (
    <motion.section
      ref={ref}
      style={{ background: "#f5f3ef", fontFamily: "var(--font-annie)", width: "100%", position: "relative", overflow: "hidden" }}
    >
      <style>{`
        @media (max-width: 767px) {
          .features-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .features-inner { padding: 64px 20px 64px 40px !important; }
          .features-stats { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .features-grid { gap: 40px !important; }
          .features-inner { padding: 80px 24px !important; }
        }
      `}</style>

      <RoughBorder id="features-outer" />

      {/* vertical rules */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "clamp(16px,4vw,48px)", width: 4, background: "#1c1917", opacity: 1 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: "clamp(16px,4vw,48px)", width: 4, background: "#1c1917", opacity: 1 }} />

      <motion.div style={{ y: isMounted ? y : 0 }}>
        <div className="features-inner" style={{ maxWidth: 1152, margin: "0 auto", padding: "96px 32px" }}>

          <p style={{ fontSize: 13, letterSpacing: "0.08em", marginBottom: 24 }}>
            THE MASKED FLOW
          </p>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>

            {/* LEFT */}
            <div>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 60px)", marginBottom: 24 }}>
                What the model<br />
                <span style={{ color: "#78716c", fontStyle: "italic" }}>never sees.</span>
              </h2>
              <p style={{ marginBottom: 36 }}>
                Every sensitive field is swapped before the prompt leaves your server.
              </p>
              {bullets.map((b) => (
                <div key={b} style={{ marginBottom: 14 }}>• {b}</div>
              ))}
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* BEFORE */}
              <div style={{ position: "relative", background: "#faf9f6", padding: "20px 24px", borderRadius: 12 }}>
                <RoughBorder id="before" />
                <p style={{ fontSize: 11, color: "#78716c", marginBottom: 16, fontFamily: "monospace" }}>PROMPT SENT BY YOUR APP</p>
                {fields.map(({ key, raw, masked }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", flexWrap: "wrap", gap: 4 }}>
                    <span style={{ color: "#78716c" }}>{key}</span>
                    <motion.span key={step} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.35 }}>
                      {step === 0 ? raw : masked}
                    </motion.span>
                  </div>
                ))}
              </div>

              {/* ARROW */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#d6d3d1" }} />
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontFamily: "monospace", fontSize: 11 }}>vault. masks</motion.span>
                <div style={{ flex: 1, height: 1, background: "#d6d3d1" }} />
                <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>↓</motion.div>
              </div>

              {/* AFTER */}
              <div style={{ position: "relative", background: "#f0fdf4", padding: "20px 24px", borderRadius: 12 }}>
                <RoughBorder id="after" stroke="#4ade80" />
                <p style={{ fontSize: 11, color: "#16a34a", marginBottom: 16, fontFamily: "monospace" }}>WHAT THE LLM RECEIVES</p>
                {fields.map(({ key, masked }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", flexWrap: "wrap", gap: 4 }}>
                    <span style={{ color: "#78716c" }}>{key}</span>
                    <motion.span key={step + key} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ color: "#16a34a", fontStyle: "italic" }}>
                      {masked}
                    </motion.span>
                  </div>
                ))}
              </div>

              {/* STATS */}
              <div className="features-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {["0 bytes", "<2 ms", "any LLM"].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: 12, background: "#faf9f6", textAlign: "center" }}>
                    {s}
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}