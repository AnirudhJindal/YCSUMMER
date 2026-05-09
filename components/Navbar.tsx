"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black via-black/60 to-transparent text-white flex justify-between items-center px-12 py-3"
      style={{ fontFamily: "var(--font-annie)" }}
    >
      {/* LOGO */}
      <a href="/" className="text-xl font-light tracking-[-0.04em] scale-x-[1.05] hover:scale-115 transition-all no-underline text-white">
        Vault.
      </a>

      {/* NAV LINKS */}
      <div className="flex gap-10 text-lg tracking-[-0.03em] text-white/60">
        <a href="/Docs" className="hover:text-white hover:scale-115 transition-all no-underline text-white/60">Docs</a>
        <a href="/pricing" className="hover:text-white hover:scale-115 transition-all no-underline text-white/60">Pricing</a>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 text-lg tracking-[-0.02em]">
        <a href="/auth" className="px-4 py-1.5 border border-white/20 rounded-md hover:bg-white/5 hover:scale-115 transition-all no-underline text-white">
          Sign in
        </a>
        <a href="/auth" className="px-4 py-1.5 border border-white/20 rounded-md hover:bg-white/5 hover:scale-115 transition-all no-underline text-white">
          Get access
        </a>
      </div>
    </motion.div>
  );
}