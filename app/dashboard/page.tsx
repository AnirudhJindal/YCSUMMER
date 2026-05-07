"use client";

import { useEffect, useState } from "react";

import RequestChart from "@/components/dashboard/RequestChart";
import StatCard from "@/components/dashboard/StatCard";
import UsageRing from "@/components/dashboard/UsageRing";

import { api } from "@/lib/api";

type Usage = {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  maskCount: number;
  unmaskCount: number;
};

export default function DashboardPage() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api<Usage>("/api/usage");

        setUsage(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (!usage) {
    return (
      <div className="text-white/40">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Overview
          </h1>

          <p className="text-white/40 mt-2">
            Manage your vault infrastructure.
          </p>
        </div>

        <div className="px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm">
          Free Trial — 5,000 req/month
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Requests This Month"
          value={usage.thisMonth.toLocaleString()}
          sub={`${5000 - usage.thisMonth} remaining`}
        />

        <StatCard
          label="Today"
          value={usage.today.toLocaleString()}
          sub="Live usage"
        />

        <StatCard
          label="Mask Requests"
          value={usage.maskCount.toLocaleString()}
          sub="All-time masks"
        />

        <StatCard
          label="Unmask Requests"
          value={usage.unmaskCount.toLocaleString()}
          sub="All-time unmask"
        />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <RequestChart />

        <UsageRing
          used={usage.thisMonth}
          limit={5000}
        />
      </div>
    </div>
  );
}