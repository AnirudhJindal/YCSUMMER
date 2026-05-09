"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
function RoughBorder({ id, stroke = "#1c1917" }: { id: string; stroke?: string }) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id={id}>
          <feTurbulence baseFrequency="0.03" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        width="calc(100% - 4px)"
        height="calc(100% - 4px)"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        rx="10"
        filter={`url(#${id})`}
      />
    </svg>
  );
}

export default function WaitlistCTA() {
  const router = useRouter();

  function handleJoin() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    router.push("/auth");
  }

  const ref = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const marqueeY = useTransform(scrollYProgress, [0, 1], ["0px", "30px"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "20px"]);

  return (
    <section
      ref={ref}
      style={{
        background: "#f5f3ef",
        fontFamily: "var(--font-annie)",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Outer border */}
      <RoughBorder id="cta-outer" />

      {/* Vertical lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "clamp(16px, 4vw, 48px)",
            width: 4,
            background: "#1c1917",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "clamp(16px, 4vw, 48px)",
            width: 4,
            background: "#1c1917",
          }}
        />
      </div>

      {/* MARQUEE */}
      <motion.div
        style={{
          y: isMounted ? marqueeY : 0,
          borderBottom: "4px solid #1c1917",
          overflow: "hidden",
          padding: "20px 0",
        }}
      >
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>

        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "marquee 18s linear infinite",
            width: "max-content",
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: "clamp(24px, 3vw, 40px)",
                color: i % 2 === 0 ? "#0c0a09" : "#57534e",
                paddingRight: "clamp(32px, 5vw, 72px)",
                fontStyle: i % 2 !== 0 ? "italic" : "normal",
              }}
            >
              {i % 2 === 0 ? "Your data stays yours." : "Always."}
            </span>
          ))}
        </div>
      </motion.div>

      {/* CTA CONTENT */}
      <motion.div
        style={{
          y: isMounted ? contentY : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 32px 96px",
          gap: 28,
          textAlign: "center",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{ fontSize: 13, letterSpacing: "0.12em", color: "#57534e", margin: 0 }}
        >
          EARLY ACCESS
        </motion.p>

        <motion.h3
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{
            fontSize: "clamp(30px, 4.5vw, 52px)",
            color: "#0c0a09",
            margin: 0,
            lineHeight: 1.1,
            fontWeight: 400,
          }}
        >
          Ship LLM features.<br />
          <span style={{ color: "#44403c", fontStyle: "italic" }}>
            Without the risk.
          </span>
        </motion.h3>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{ position: "relative", marginTop: 8 }}
        >
          <RoughBorder id="cta-btn" />

          {/* ✅ UPDATED BUTTON */}
          <motion.button
           onClick={handleJoin}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              background: "#0c0a09",
              color: "#f5f3ef",
              border: "none",
              padding: "18px 48px",
              fontSize: "20px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            StartNow
          </motion.button>
        </motion.div>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{ fontSize: 14, color: "#57534e", margin: 0 }}
        >
          No credit card. No spam. Just early access.
        </motion.p>
      </motion.div>
    </section>
  );
}