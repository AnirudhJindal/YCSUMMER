"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabse/client";
import { useState } from "react";

import {
  LayoutDashboard,
  EyeOff,
  BookText,
  Key,
  FileText,
  Database,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Usage", href: "/dashboard/usage", icon: BarChart3 },
  { label: "Mask", href: "/dashboard/mask", icon: EyeOff },
  { label: "Docs", href: "/dashboard/Docs", icon: BookText },
  { label: "API Keys", href: "/dashboard/keys", icon: Key },
  { label: "Vault Tokens", href: "/dashboard/tokens", icon: Database },
  { label: "Audit Logs", href: "/dashboard/logs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  const NavContent = () => (
    <>
      <Link href="/" className="text-2xl font-bold mb-10 tracking-tight hover:opacity-80 transition-opacity">
        vault<span className="text-violet-400">.</span>
      </Link>

      <div className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                active
                  ? "bg-violet-500/10 border-violet-400/20 text-violet-300"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleSignOut}
        className="mt-auto flex items-center gap-3 text-red-400/70 hover:text-red-400 transition-all px-4 py-3 rounded-xl hover:bg-red-500/10"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </>
  );

  return (
    <>
      {/* ─── DESKTOP sidebar (unchanged) ─────────────────────────────── */}
      <aside className="hidden md:flex w-[250px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex-col h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* ─── MOBILE top bar ──────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-b border-white/10"
        style={{ background: "rgba(10,10,20,0.97)", backdropFilter: "blur(16px)" }}
      >
        <div className="text-xl font-bold tracking-tight">
          vault<span className="text-violet-400">.</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ─── MOBILE drawer overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="md:hidden fixed top-0 left-0 h-full w-[280px] z-50 flex flex-col p-6 border-r border-white/10"
            style={{ background: "rgba(10,10,20,0.99)", backdropFilter: "blur(24px)" }}
          >
            {/* Close button in drawer header */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </>
      )}

      {/* ─── MOBILE top-bar spacer ───────────────────────────────────── */}
      <div className="md:hidden h-[62px]" />
    </>
  );
}