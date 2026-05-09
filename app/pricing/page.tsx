"use client";

import { motion, type Variants } from "framer-motion";
import { useState, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Feature = {
  label: string;
  note: string | null;
  disabled: boolean; // always explicit — no optional, avoids TS2339
};

type Tier = {
  name: string;
  price: string | null;
  period: string | null;
  tagline: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  database: boolean;
  features: Feature[];
};

// ── Data ─────────────────────────────────────────────────────────────────────
const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Start masking, no card needed.",
    cta: "Start for free",
    ctaHref: "/dashboard",
    highlight: false,
    database: false,
    features: [
      { label: "5,000 API requests / month", note: null, disabled: false },
      { label: "Mask & unmask plain text", note: null, disabled: false },
      { label: "Deep JSON masking", note: null, disabled: false },
      { label: "Shared vault infrastructure", note: "multi-tenant", disabled: false },
      { label: "Token TTL: 30 days", note: null, disabled: false },
      { label: "1 API key", note: null, disabled: false },
      { label: "Community support", note: null, disabled: false },
      { label: "Dedicated database", note: null, disabled: true },
      { label: "Custom retention policies", note: null, disabled: true },
      { label: "SLA guarantee", note: null, disabled: true },
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: null,
    tagline: "Your own vault. Your own rules.",
    cta: "Let's talk",
    ctaHref: "mailto:vaultyin@gmail.com?subject=Enterprise%20Plan%20Inquiry&body=Hi%2C%20I%27m%20interested%20in%20the%20Enterprise%20plan.",
    highlight: true,
    database: true,
    features: [
      { label: "Unlimited API requests", note: null, disabled: false },
      { label: "Mask & unmask plain text", note: null, disabled: false },
      { label: "Deep JSON masking", note: null, disabled: false },
      { label: "Dedicated database", note: "fully isolated", disabled: false },
      { label: "Custom token TTL", note: null, disabled: false },
      { label: "Unlimited API keys", note: null, disabled: false },
      { label: "Dedicated Slack support", note: null, disabled: false },
      { label: "Custom retention policies", note: null, disabled: false },
      { label: "99.9% uptime SLA", note: null, disabled: false },
      { label: "SOC 2 / HIPAA alignment", note: "on request", disabled: false },
    ],
  },
];

// ── Animation ─────────────────────────────────────────────────────────────────
// Defined as Variants so framer-motion types are satisfied without spreading issues
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  // Hydration-safe: only enable hover effects after mount
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="min-h-screen bg-[#080808] text-white overflow-x-hidden"
      style={{ fontFamily: "var(--font-annie)" }}
    >
      {/* Grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-white/[0.03] blur-[120px]"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-36 pb-28">

        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-20"
        >
          <p className="text-sm tracking-[0.25em] uppercase text-white/30 mb-5">Pricing</p>
          <h1 className="text-6xl sm:text-7xl font-light tracking-[-0.04em] leading-[1.05] mb-6">
            Pay for what you mask.
            <br />
            <span className="text-white/30">Nothing more.</span>
          </h1>
          <p className="text-white/40 text-xl max-w-lg mx-auto leading-relaxed tracking-[-0.02em]">
            Every plan gives you the same core API — masking, unmasking, deep JSON — the tiers differ in scale and isolation.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
        >
          {TIERS.map((tier) => {
            return (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                onMouseEnter={() => mounted && setHovered(tier.name)}
                onMouseLeave={() => mounted && setHovered(null)}
                whileHover={!tier.highlight ? { scale: 1.03, transition: { duration: 0.25, ease } } : {}}
                className={[
                  "relative rounded-2xl p-8 flex flex-col transition-colors duration-300",
                  tier.highlight
                    ? "bg-white text-[#080808] shadow-[0_0_80px_rgba(255,255,255,0.10)]"
                    : "bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]",
                ].join(" ")}
              >
                {/* Most popular badge */}
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#080808] text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-white/10">
                    Most popular
                  </div>
                )}

                {/* Name + DB badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={[
                      "text-sm font-medium tracking-[0.15em] uppercase",
                      tier.highlight ? "text-black/40" : "text-white/30",
                    ].join(" ")}
                  >
                    {tier.name}
                  </span>
                  {tier.database && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/[0.15] text-emerald-400 border border-emerald-500/20 tracking-wide">
                      Dedicated DB
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  {tier.price !== null ? (
                    <div className="flex items-end gap-1.5">
                      <span
                        className={[
                          "text-6xl font-light tracking-[-0.04em]",
                          tier.highlight ? "text-black" : "text-white",
                        ].join(" ")}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={[
                          "text-base mb-2",
                          tier.highlight ? "text-black/40" : "text-white/30",
                        ].join(" ")}
                      >
                        /{tier.period}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={[
                        "text-5xl font-light tracking-[-0.04em]",
                        tier.highlight ? "text-black" : "text-white",
                      ].join(" ")}
                    >
                      Custom
                    </div>
                  )}
                  <p
                    className={[
                      "text-base mt-2 tracking-[-0.01em]",
                      tier.highlight ? "text-black/50" : "text-white/[0.35]",
                    ].join(" ")}
                  >
                    {tier.tagline}
                  </p>
                </div>

                {/* CTA */}
                <a
                  href={tier.ctaHref}
                  className={[
                    "block text-center py-3 rounded-xl text-base font-medium tracking-[-0.01em] transition-colors mb-8",
                    tier.highlight
                      ? "bg-[#080808] text-white hover:bg-black/80"
                      : "bg-white/[0.08] text-white border border-white/[0.15] hover:bg-white/[0.14]",
                  ].join(" ")}
                >
                  {tier.cta}
                </a>

                {/* Divider */}
                <div
                  className={[
                    "w-full h-px mb-6",
                    tier.highlight ? "bg-black/10" : "bg-white/[0.08]",
                  ].join(" ")}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3.5">
                  {tier.features.map((f) => (
                    <li
                      key={f.label}
                      className={[
                        "flex items-start gap-2.5 text-base tracking-[-0.01em]",
                        f.disabled ? "opacity-25" : "",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "mt-0.5 text-base leading-none shrink-0",
                          f.disabled
                            ? tier.highlight ? "text-black/25" : "text-white/20"
                            : tier.highlight ? "text-black" : "text-emerald-400",
                        ].join(" ")}
                      >
                        {f.disabled ? "–" : "✓"}
                      </span>
                      <span className={tier.highlight ? "text-black/70" : "text-white/60"}>
                        {f.label}
                        {f.note !== null && (
                          <span
                            className={[
                              "ml-1.5 text-[11px] px-1.5 py-0.5 rounded",
                              tier.highlight
                                ? "bg-black/[0.08] text-black/35"
                                : "bg-white/[0.06] text-white/30",
                            ].join(" ")}
                          >
                            {f.note}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={headerVariants}
          initial="hidden"
          animate="show"
          className="text-center text-white/20 text-sm mt-14 tracking-[-0.01em]"
        >
          All plans include the same core API. Overages on Free are hard-stopped; Pro overages billed at $0.05 / 1k requests.
          <br />
          Need a volume deal?{" "}
          <a
            href="mailto:hello@vaultit.dev"
            className="text-white/50 underline underline-offset-2 hover:text-white transition-colors"
          >
            hello@vaultit.dev
          </a>
        </motion.p>
      </div>
    </div>
  );
}