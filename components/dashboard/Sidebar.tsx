"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  EyeOff,
  Eye,
  Key,
  FileText,
  Database,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
  {
    label: "Mask",
    href: "/dashboard/mask",
    icon: EyeOff,
  },
  {
    label: "Unmask",
    href: "/dashboard/unmask",
    icon: Eye,
  },
  {
    label: "API Keys",
    href: "/dashboard/keys",
    icon: Key,
  },
  {
    label: "Vault Tokens",
    href: "/dashboard/tokens",
    icon: Database,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/logs",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[250px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col">
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

      <button className="mt-auto flex items-center gap-3 text-red-400/70 hover:text-red-400 transition-all px-4 py-3 rounded-xl hover:bg-red-500/10">
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}