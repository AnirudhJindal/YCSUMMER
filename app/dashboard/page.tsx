"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

const POLL_INTERVAL = 10_000; // 10 seconds
const FREE_LIMIT = 5_000;

export default function DashboardPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUsage = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const data = await api<Usage>("/api/usage");
      setUsage(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchUsage();
    intervalRef.current = setInterval(() => fetchUsage(), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUsage]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") fetchUsage();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchUsage]);

  if (!usage) {
    return (
      <div className="flex items-center gap-3 text-white/40">
        <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  const remaining = Math.max(0, FREE_LIMIT - usage.thisMonth);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Overview</h1>
          <p className="text-white/40 mt-2">Manage your vault infrastructure.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Live"}
          </div>

          {/* Manual refresh */}
          <button
            onClick={() => fetchUsage(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-40"
            title="Refresh now"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm">
            Free Trial — {FREE_LIMIT.toLocaleString()} req/month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Requests This Month"
          value={usage.thisMonth.toLocaleString()}
          sub={`${remaining.toLocaleString()} remaining`}
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
        <UsageRing used={usage.thisMonth} limit={FREE_LIMIT} />
      </div>
    </div>
  );
}