"use client";

import { createClient } from "@/lib/supabse/client";

export default function AuthPage() {
  const supabase = createClient();

  async function continueWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",

      options: {
        redirectTo:
          `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0f",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
      `}</style>

      {/* Blobs */}

      {[
        {
          w: 380,
          h: 380,
          bg: "#5b21b6",
          top: -80,
          left: -60,
          opacity: 0.55,
        },

        {
          w: 320,
          h: 320,
          bg: "#2563eb",
          bottom: -60,
          right: -40,
          opacity: 0.5,
        },

        {
          w: 260,
          h: 260,
          bg: "#7c3aed",
          bottom: 20,
          left: "30%",
          opacity: 0.35,
        },

        {
          w: 200,
          h: 200,
          bg: "#0ea5e9",
          top: 40,
          right: "20%",
          opacity: 0.3,
        },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",

            width: b.w,
            height: b.h,
            background: b.bg,
            opacity: b.opacity,

            top: b.top,
            left: b.left,
            bottom: (b as any).bottom,
            right: (b as any).right,
          }}
        />
      ))}

      {/* Card */}

      <div
        style={{
          position: "relative",
          zIndex: 1,

          width: "100%",
          maxWidth: 430,

          background: "rgba(255,255,255,0.06)",

          border:
            "0.5px solid rgba(255,255,255,0.12)",

          borderRadius: 20,

          padding: "2rem",

          backdropFilter: "blur(24px)",

          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,

              background:
                "rgba(255,255,255,0.9)",

              borderRadius: 8,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className="ti ti-shield-lock"
              style={{
                fontSize: 16,
                color: "#0a0a0f",
              }}
            />
          </div>

          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color:
                "rgba(255,255,255,0.92)",

              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Vault
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 10,
            lineHeight: 1.1,
          }}
        >
          Secure AI Infrastructure
        </h1>

        <p
          style={{
            fontSize: 14,
            color:
              "rgba(255,255,255,0.5)",

            marginBottom: "1.8rem",
            lineHeight: 1.7,
          }}
        >
          Privacy-first infrastructure for AI
          agents handling sensitive data.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,

            background:
              "rgba(139,92,246,0.12)",

            color: "#c4b5fd",

            border:
              "0.5px solid rgba(139,92,246,0.25)",

            fontSize: 12,
            fontWeight: 500,

            padding: "4px 10px",

            borderRadius: 8,

            marginBottom: "1.8rem",
          }}
        >
          <i className="ti ti-lock" />
          Google-secured authentication
        </div>

        <button
          onClick={continueWithGoogle}
          style={{
            width: "100%",
            padding: "12px",

            background: "#fff",

            color: "#0a0a0f",

            border: "none",

            borderRadius: 12,

            fontSize: 15,
            fontWeight: 700,

            cursor: "pointer",

            marginBottom: "1.8rem",
          }}
        >
          Continue with Google
        </button>

        <div
          style={{
            height: "0.5px",

            background:
              "rgba(255,255,255,0.1)",

            margin: "1.5rem 0",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            "Persistent sessions",
            "Protected dashboard access",
            "API key management",
            "Encrypted token vault",
          ].map((f) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,

                fontSize: 13,

                color:
                  "rgba(255,255,255,0.42)",
              }}
            >
              <i
                className="ti ti-check"
                style={{
                  fontSize: 15,
                  color: "#a78bfa",
                }}
              />

              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}