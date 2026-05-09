"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

const POLL_INTERVAL = 10_000;
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

  useEffect(() => {
    fetchUsage();
    intervalRef.current = setInterval(() => fetchUsage(), POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchUsage]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") fetchUsage();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchUsage]);

  if (!usage) {
    return (
      <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a3e">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton width={160} height={36} className="mb-2" />
              <Skeleton width={260} height={16} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton width={130} height={24} borderRadius={999} />
              <Skeleton width={28} height={28} borderRadius={8} />
              <Skeleton width={210} height={36} borderRadius={999} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 p-4">
                <Skeleton height={13} width="55%" className="mb-3" />
                <Skeleton height={28} width="75%" className="mb-2" />
                <Skeleton height={13} width="45%" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div className="rounded-2xl border border-white/5 p-5">
              <Skeleton height={16} width={120} className="mb-6" />
              <Skeleton height={180} />
            </div>
            <div className="rounded-2xl border border-white/5 p-5 flex flex-col items-center justify-center gap-4">
              <Skeleton circle width={140} height={140} />
              <Skeleton width={80} height={16} />
              <Skeleton width={120} height={13} />
            </div>
          </div>
        </div>
      </SkeletonTheme>
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
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Live"}
          </div>
          <button
            onClick={() => fetchUsage(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-40"
            title="Refresh now"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm">
            Free Trial — {FREE_LIMIT.toLocaleString()} req/month
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Requests This Month" value={usage.thisMonth.toLocaleString()} sub={`${remaining.toLocaleString()} remaining`} />
        <StatCard label="Today" value={usage.today.toLocaleString()} sub="Live usage" />
        <StatCard label="Mask Requests" value={usage.maskCount.toLocaleString()} sub="All-time masks" />
        <StatCard label="Unmask Requests" value={usage.unmaskCount.toLocaleString()} sub="All-time unmask" />
      </div>
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <RequestChart />
        <UsageRing used={usage.thisMonth} limit={FREE_LIMIT} />
      </div>
    </div>
  );
}