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
  { label: "Docs", href: "/Docs", icon: BookText },
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
      <div className="text-2xl font-bold mb-10 tracking-tight">
        vault<span className="text-violet-400">.</span>
      </div>

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
      <style>{`
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-bar { display: flex !important; }
        }
        @media (min-width: 768px) {
          .sidebar-mobile-bar { display: none !important; }
          .sidebar-mobile-drawer { display: none !important; }
        }
      `}</style>

      {/* DESKTOP sidebar */}
      <aside className="sidebar-desktop w-[250px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* MOBILE top bar */}
      <div
        className="sidebar-mobile-bar hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-b border-white/10"
        style={{ background: "rgba(10,10,20,0.95)", backdropFilter: "blur(16px)" }}
      >
        <div className="text-xl font-bold tracking-tight">
          vault<span className="text-violet-400">.</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE drawer */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-drawer fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-[280px] h-full flex flex-col p-6 border-r border-white/10"
            style={{ background: "rgba(10,10,20,0.98)", backdropFilter: "blur(20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </aside>
        </div>
      )}

      {/* MOBILE top-bar spacer so content isn't hidden under it */}
      <div className="sidebar-mobile-bar hidden h-[60px]" />
    </>
  );
}