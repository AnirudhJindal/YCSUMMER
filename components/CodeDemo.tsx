"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const BASE_URL = "https://ycsummer.vercel.app";

const steps = [
  {
    number: "01",
    title: "Intercept your prompt",
    description:
      "The user's plain-text instruction is intercepted before it leaves your server. Vault scans it and masks every piece of sensitive information inline.",
    code: [
      { text: "// Raw user instruction — PII fully exposed\n", color: "#6a9955" },
      { text: "const ", color: "#569cd6" },
      { text: "userInput", color: "#9cdcfe" },
      { text: " =\n", color: "#d4d4d4" },
      { text: '  "Send Usha Sharma 1000 Rs from my\\n', color: "#ce9178" },
      { text: '   HDFC account 4081 2291 3301 4821\\n', color: "#ce9178" },
      { text: '   to usha.sharma@okicici"\n\n', color: "#ce9178" },
      { text: "// POST to /api/mask before sending anywhere\n", color: "#6a9955" },
      { text: "const ", color: "#569cd6" },
      { text: "res", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "await ", color: "#c586c0" },
      { text: "fetch", color: "#dcdcaa" },
      { text: `(\`${BASE_URL}/api/mask\`, {\n`, color: "#ce9178" },
      { text: "  method", color: "#9cdcfe" },
      { text: ': ', color: "#d4d4d4" },
      { text: '"POST"', color: "#ce9178" },
      { text: ",\n  headers", color: "#d4d4d4" },
      { text: ": { ", color: "#d4d4d4" },
      { text: '"Authorization"', color: "#ce9178" },
      { text: ": `Bearer ${apiKey}`, ", color: "#d4d4d4" },
      { text: '"Content-Type"', color: "#ce9178" },
      { text: ': ', color: "#d4d4d4" },
      { text: '"application/json"', color: "#ce9178" },
      { text: " },\n  body", color: "#d4d4d4" },
      { text: ": ", color: "#d4d4d4" },
      { text: "JSON", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "stringify", color: "#dcdcaa" },
      { text: "({ text: userInput }),\n})\n", color: "#d4d4d4" },
      { text: "const ", color: "#569cd6" },
      { text: "{ masked }", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "await ", color: "#c586c0" },
      { text: "res", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "json", color: "#dcdcaa" },
      { text: "()", color: "#d4d4d4" },
    ],
  },
  {
    number: "02",
    title: "Masked string goes to the LLM",
    description:
      "Names, account numbers, UPI IDs and amounts are replaced with stable tokens — right inside the sentence. The masked string is what the LLM sees. Real values never leave your server.",
    code: [
      { text: "// masked = string with tokens instead of PII\n", color: "#6a9955" },
      { text: "console", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "log", color: "#dcdcaa" },
      { text: "(masked)\n", color: "#d4d4d4" },
      { text: '// "Send [NAME_0] [AMOUNT_0] from my\n', color: "#f4a261" },
      { text: '//  HDFC account [ACCOUNT_0]\n', color: "#f4a261" },
      { text: '//  to [UPI_0]"\n\n', color: "#f4a261" },
      { text: "// Safe to send to any external LLM — zero PII on the wire\n", color: "#6a9955" },
      { text: "const ", color: "#569cd6" },
      { text: "llmResponse", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "await ", color: "#c586c0" },
      { text: "openai", color: "#dcdcaa" },
      { text: ".chat.completions.", color: "#d4d4d4" },
      { text: "create", color: "#dcdcaa" },
      { text: "({\n", color: "#d4d4d4" },
      { text: "  model", color: "#9cdcfe" },
      { text: ': ', color: "#d4d4d4" },
      { text: '"gpt-4o"', color: "#ce9178" },
      { text: ",\n  messages", color: "#d4d4d4" },
      { text: ": [{ role: ", color: "#d4d4d4" },
      { text: '"user"', color: "#ce9178" },
      { text: ", content: masked }],\n})", color: "#d4d4d4" },
      { text: " // ✓ zero PII on the wire", color: "#6a9955" },
    ],
  },
  {
    number: "03",
    title: "LLM routes to an agent",
    description:
      "The LLM receives the masked string, understands the intent, and returns structured JSON specifying which agent to invoke and the parameters to use. Tokens stay in place throughout.",
    code: [
      { text: "// LLM returns structured routing JSON — tokens intact\n", color: "#6a9955" },
      { text: "console", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "log", color: "#dcdcaa" },
      { text: "(llmResponse)\n", color: "#d4d4d4" },
      { text: "// {\n", color: "#6a9955" },
      { text: '//   agent:  "payment_agent",\n', color: "#6a9955" },
      { text: '//   action: "send_money",\n', color: "#6a9955" },
      { text: '//   params: {\n', color: "#6a9955" },
      { text: '//     recipient_name: "[NAME_0]",\n', color: "#f4a261" },
      { text: '//     recipient_upi:  "[UPI_0]",\n', color: "#f4a261" },
      { text: '//     from_account:   "[ACCOUNT_0]",\n', color: "#f4a261" },
      { text: '//     amount:         "[AMOUNT_0]"\n', color: "#f4a261" },
      { text: '//   }\n', color: "#6a9955" },
      { text: "// }\n", color: "#6a9955" },
    ],
  },
  {
    number: "04",
    title: "Restore, then execute",
    description:
      "Before the agent runs, POST to /api/unmask and every token is swapped back to its real value. The agent receives clean, complete data — and executes with full fidelity.",
    code: [
      { text: "// POST to /api/unmask before executing\n", color: "#6a9955" },
      { text: "const ", color: "#569cd6" },
      { text: "unmaskRes", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "await ", color: "#c586c0" },
      { text: "fetch", color: "#dcdcaa" },
      { text: `(\`${BASE_URL}/api/unmask\`, {\n`, color: "#ce9178" },
      { text: "  method", color: "#9cdcfe" },
      { text: ': ', color: "#d4d4d4" },
      { text: '"POST"', color: "#ce9178" },
      { text: ",\n  headers", color: "#d4d4d4" },
      { text: ": { ", color: "#d4d4d4" },
      { text: '"Authorization"', color: "#ce9178" },
      { text: ": `Bearer ${apiKey}`, ", color: "#d4d4d4" },
      { text: '"Content-Type"', color: "#ce9178" },
      { text: ': ', color: "#d4d4d4" },
      { text: '"application/json"', color: "#ce9178" },
      { text: " },\n  body", color: "#d4d4d4" },
      { text: ": ", color: "#d4d4d4" },
      { text: "JSON", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "stringify", color: "#dcdcaa" },
      { text: "({text:", color: "#d4d4d4" },
      { text: "JSON", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "stringify", color: "#dcdcaa" },
      { text: "(llmResponse)}),\n})\n", color: "#d4d4d4" },
      { text: "const ", color: "#569cd6" },
      { text: "{ unmasked }", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "await ", color: "#c586c0" },
      { text: "unmaskRes", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "json", color: "#dcdcaa" },
      { text: "()\n", color: "#d4d4d4" },
      { text: "const ", color: "#569cd6" },
      { text: "agentCall", color: "#9cdcfe" },
      { text: " = ", color: "#d4d4d4" },
      { text: "JSON", color: "#9cdcfe" },
      { text: ".", color: "#d4d4d4" },
      { text: "parse", color: "#dcdcaa" },
      { text: "(unmasked)\n\n", color: "#d4d4d4" },
      { text: "// agentCall.params now holds real values:\n", color: "#6a9955" },
      { text: '// recipient_name: "Usha Sharma"\n', color: "#6a9955" },
      { text: '// from_account:   "4081 2291 3301 4821"\n\n', color: "#6a9955" },
      { text: "await ", color: "#c586c0" },
      { text: "agents", color: "#9cdcfe" },
      { text: "[agentCall.agent].", color: "#d4d4d4" },
      { text: "run", color: "#dcdcaa" },
      { text: "(agentCall) ", color: "#d4d4d4" },
      { text: "// ✓ transfer executed", color: "#6a9955" },
    ],
  },
];

function RoughBorder({ id }: { id: string }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <filter id={id}>
          <feTurbulence baseFrequency="0.03" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>
      <rect x="2" y="2" style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }} fill="none" stroke="#1c1917" strokeWidth="2.2" rx="10" filter={`url(#${id})`} />
    </svg>
  );
}

function MacCodeCard({ code, active, borderId, alwaysVisible }: { code: { text: string; color: string }[]; active: boolean; borderId: string; alwaysVisible?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        opacity: alwaysVisible ? 1 : active ? 1 : 0,
        transform: alwaysVisible ? "none" : active ? "translateY(0px)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        pointerEvents: alwaysVisible ? "auto" : active ? "auto" : "none",
      }}
    >
      <RoughBorder id={borderId} />
      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#1e1e1e" }}>
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", background: "#2d2d2d", borderBottom: "1px solid #3a3a3a" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>vault-integration.ts</span>
        </div>
        {/* Line numbers + code */}
        <div style={{ display: "flex", padding: "20px 0", overflowX: "auto" }}>
          <div style={{ padding: "0 16px", textAlign: "right", userSelect: "none", borderRight: "1px solid #3a3a3a", minWidth: 48, flexShrink: 0 }}>
            {(() => {
              const lineCount = code.reduce((acc, t) => acc + (t.text.match(/\n/g) || []).length, 0);
              return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: "1.75", color: "#4a4a4a", fontFamily: "monospace" }}>{i + 1}</div>
              ));
            })()}
          </div>
          <pre style={{ padding: "0 16px", margin: 0, fontSize: "12px", lineHeight: "1.75", fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", whiteSpace: "pre-wrap", flex: 1, wordBreak: "break-word" }}>
            {code.map((token, i) => (
              <span key={i} style={{ color: token.color }}>{token.text}</span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

function MobileStepCard({ step }: { step: typeof steps[0] }) {
  return (
    <div style={{ position: "relative", background: "#faf9f6", padding: "24px", borderRadius: 12 }}>
      <RoughBorder id={`mobile-left-${step.number}`} />
      <div style={{ fontSize: "56px", color: "#1c1917", opacity: 0.18, lineHeight: 1, marginBottom: "8px" }}>
        {step.number}
      </div>
      <h3 style={{ fontSize: "22px", color: "#0c0a09", margin: "0 0 10px" }}>{step.title}</h3>
      <p style={{ color: "#1c1917", lineHeight: 1.7, margin: 0, fontSize: "15px" }}>{step.description}</p>
    </div>
  );
}

export default function CodeDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0px", "36px"]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      let closest = 0;
      let dist = Infinity;
      stepRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const d = Math.abs(center - window.innerHeight / 2);
        if (d < dist) { dist = d; closest = i; }
      });
      setActiveStep(closest);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  return (
    <motion.section ref={sectionRef} style={{ background: "#f5f3ef", fontFamily: "var(--font-annie)", position: "relative" }}>
      <style>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          .codedemo-main { gap: 32px !important; padding: 0 24px 100px !important; }
          .codedemo-left { width: 44% !important; }
          .codedemo-header { padding: 80px 24px 48px !important; }
        }
      `}</style>

      <RoughBorder id="section-outer" />

      <div style={{ position: "absolute", top: 0, bottom: 0, left: "clamp(16px, 4vw, 48px)", width: 4, background: "#1c1917", opacity: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: "clamp(16px, 4vw, 48px)", width: 4, background: "#1c1917", opacity: 1, pointerEvents: "none" }} />

      {/* HEADER */}
      <motion.div style={{ y: parallaxY }}>
        <div
          className="codedemo-header"
          style={{ maxWidth: 1152, margin: "0 auto", padding: isMobile ? "72px 20px 32px 40px" : "96px 32px 64px" }}
        >
          <p style={{ fontSize: 14, letterSpacing: "0.08em", color: "#292524" }}>WHAT WE DO</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#0c0a09", margin: 0 }}>
            Four steps.<br />
            <span style={{ color: "#292524" }}>Zero exposure.</span>
          </h2>
        </div>
      </motion.div>

      {/* MOBILE */}
      {isMobile && (
        <div style={{ padding: "0 20px 80px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MobileStepCard step={step} />
              <MacCodeCard
                code={step.code}
                active={true}
                alwaysVisible={true}
                borderId={`mobile-code-${i}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP */}
      {!isMobile && (
        <div
          className="codedemo-main"
          style={{ maxWidth: 1152, margin: "0 auto", padding: "0 32px 128px", display: "flex", gap: "48px", alignItems: "flex-start" }}
        >
          {/* LEFT — sticky info panel */}
          <div
            className="codedemo-left"
            style={{ width: "38%", position: "sticky", top: "28vh", alignSelf: "flex-start" }}
          >
            <div style={{ position: "relative", background: "#faf9f6", padding: "32px" }}>
              <RoughBorder id="left" />
              <div style={{ position: "relative" }}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      position: activeStep === i ? "relative" : "absolute",
                      top: 0, left: 0, width: "100%",
                      opacity: activeStep === i ? 1 : 0,
                      transform: activeStep === i ? "translateY(0px)" : "translateY(10px)",
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                      pointerEvents: activeStep === i ? "auto" : "none",
                    }}
                  >
                    <div style={{ fontSize: "72px", color: "#1c1917", opacity: 0.18, lineHeight: 1, marginBottom: "8px" }}>
                      {step.number}
                    </div>
                    <h3 style={{ fontSize: "26px", color: "#0c0a09", margin: "0 0 12px" }}>{step.title}</h3>
                    <p style={{ color: "#1c1917", lineHeight: 1.7, margin: 0, fontSize: "15px" }}>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — scrollable code cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "40vh" }}>
            {steps.map((step, i) => (
              <div key={i} ref={(el) => { stepRefs.current[i] = el; }}>
                <MacCodeCard code={step.code} active={activeStep === i} borderId={`code-${i}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}