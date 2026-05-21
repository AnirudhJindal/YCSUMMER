"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabse/client";

async function getAuthDestination(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session ? "/dashboard" : "/auth";
}

export default function Navbar() {
  const router = useRouter();

  async function handleAuthClick(e: React.MouseEvent) {
    e.preventDefault();
    const dest = await getAuthDestination();
    router.push(dest);
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .navbar-links { display: none !important; }
          .navbar-actions-full { display: none !important; }
          .navbar-signin-mobile { display: block !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .navbar-root { padding-left: 24px !important; padding-right: 24px !important; }
          .navbar-links { gap: 24px !important; font-size: 16px !important; }
          .navbar-actions-full { gap: 6px !important; font-size: 15px !important; }
        }
      `}</style>

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="navbar-root fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black via-black/60 to-transparent text-white flex justify-between items-center px-12 py-3"
        style={{ fontFamily: "var(--font-annie)" }}
      >
        {/* LOGO — goes to home */}
        <a
          href="/"
          className="text-xl font-light tracking-[-0.04em] scale-x-[1.05] hover:scale-115 transition-all no-underline text-white"
        >
          Vault.
        </a>

        {/* NAV LINKS — hidden on mobile */}
        <div className="navbar-links flex gap-10 text-lg tracking-[-0.03em] text-white/60">
          <a href="/dashboard/Docs" className="hover:text-white hover:scale-115 transition-all no-underline text-white/60">
            Docs
          </a>
          <a href="/pricing" className="hover:text-white hover:scale-115 transition-all no-underline text-white/60">
            Pricing
          </a>
        </div>

        {/* ACTIONS — full set on tablet/desktop */}
        <div className="navbar-actions-full flex gap-2 text-lg tracking-[-0.02em]">
          {/* Sign in — goes to /dashboard if session exists, else /auth */}
          <a
            href="/auth"
            onClick={handleAuthClick}
            className="px-4 py-1.5 border border-white/20 rounded-md hover:bg-white/5 hover:scale-115 transition-all no-underline text-white"
          >
            Sign in
          </a>
          {/* Get access — same logic */}
          <a
            href="/auth"
            onClick={handleAuthClick}
            className="px-4 py-1.5 border border-white/20 rounded-md hover:bg-white/5 hover:scale-115 transition-all no-underline text-white"
          >
            Get access
          </a>
        </div>

        {/* SIGN IN ONLY — mobile */}
        <a
          href="/auth"
          onClick={handleAuthClick}
          className="navbar-signin-mobile hidden px-4 py-1.5 border border-white/20 rounded-md no-underline text-white text-base"
          style={{ touchAction: "manipulation" }}
        >
          Sign in
        </a>
      </motion.div>
    </>
  );
}