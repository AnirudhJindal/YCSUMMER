import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "var(--font-annie)",
        background: "#000",
        color: "#f5f3ef",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      {/* Logo */}
      <div style={{ fontSize: 22, letterSpacing: "-0.01em", marginBottom: 48, opacity: 0.5 }}>
        Vaultit
      </div>

      {/* Main text */}
      <h1 style={{ fontSize: "clamp(40px, 8vw, 80px)", margin: "0 0 16px", fontWeight: 400, lineHeight: 1.1 }}>
        Coming soon.
      </h1>
      <p style={{ fontSize: 18, color: "#78716c", margin: "0 0 48px", maxWidth: 400, lineHeight: 1.7 }}>
        {"This page is still being built. Check back soon or join the waitlist to stay in the loop."}
      </p>

      {/* CTA */}
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          fontSize: 15,
          color: "#f5f3ef",
          textDecoration: "none",
          border: "1px solid #f5f3ef22",
          borderRadius: 8,
          letterSpacing: "0.02em",
          transition: "border-color 0.2s",
        }}
      >
        {"Back to home ->"}
      </Link>

      {/* Status dot */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 64, opacity: 0.4 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 6px #22c55e",
        }} />
        <span style={{ fontSize: 13, color: "#57534e" }}>All systems operational</span>
      </div>
    </div>
  );
}