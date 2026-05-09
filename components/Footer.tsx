"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
        style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        rx="10"
        filter={`url(#${id})`}
      />
    </svg>
  );
}

const links = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Docs", href: "/Docs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};

export default function Footer() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0px", "30px"]);

  return (
    <motion.footer
      ref={ref}
      style={{
        background: "#0c0a09",
        fontFamily: "var(--font-annie)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <motion.div style={{ y }}>
        {/* Vertical rules */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "clamp(16px, 4vw, 48px)",
            width: 1,
            background: "#f5f3ef",
            opacity: 0.06,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "clamp(16px, 4vw, 48px)",
            width: 1,
            background: "#f5f3ef",
            opacity: 0.06,
            pointerEvents: "none",
          }}
        />

        <div
          style={{ maxWidth: 1152, margin: "0 auto", padding: "72px 32px 40px" }}
        >
          {/* TOP ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 48,
              flexWrap: "wrap",
              paddingBottom: 56,
              borderBottom: "1px solid #f5f3ef18",
            }}
          >
            {/* BRAND */}
            <div style={{ maxWidth: 280 }}>
              <div
                style={{
                  fontSize: 28,
                  color: "#f5f3ef",
                  marginBottom: 16,
                  letterSpacing: "-0.01em",
                }}
              >
                Vaultit
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#78716c",
                  lineHeight: 1.7,
                  margin: "0 0 24px",
                }}
              >
                PII masking for LLM apps. Ship fast without exposing sensitive data.
              </p>

              {/* Waitlist pill */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <RoughBorder id="footer-cta" stroke="#f5f3ef40" />
                <a 
                  href="/auth"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    fontSize: 14,
                    color: "#f5f3ef",
                    textDecoration: "none",
                    borderRadius: 8,
                    letterSpacing: "0.02em",
                  }}
                >
                  {"Start Now ->"}
                </a>
              </div>
            </div>

            {/* NAV COLUMNS */}
            <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
              {Object.entries(links).map(([group, items]) => (
                <div key={group}>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "#57534e",
                      margin: "0 0 16px",
                    }}
                  >
                    {group.toUpperCase()}
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    {items.map((item) => (
                      <a 
                        key={item.label}
                        href={item.href}
                        style={{
                          fontSize: 15,
                          color: "#a8a29e",
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#f5f3ef")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#a8a29e")
                        }
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 28,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ fontSize: 13, color: "#57534e", margin: 0 }}>
              {"© 2025 Vaultit. All rights reserved."}
            </p>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                }}
              />
              <span style={{ fontSize: 13, color: "#57534e" }}>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  );
}