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

  /* ─── Loading skeleton ──────────────────────────────────────────── */
  if (!usage) {
    return (
      <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a3e">
        <div>
          <div className="mb-5 md:mb-8">
            <Skeleton width={160} height={32} className="mb-2" />
            <Skeleton width={220} height={14} />
          </div>
          {/* 2-col on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 p-4">
                <Skeleton height={12} width="55%" className="mb-3" />
                <Skeleton height={26} width="75%" className="mb-2" />
                <Skeleton height={12} width="45%" />
              </div>
            ))}
          </div>
          {/* stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-6">
            <div className="rounded-2xl border border-white/5 p-5">
              <Skeleton height={14} width={120} className="mb-6" />
              <Skeleton height={160} />
            </div>
            <div className="rounded-2xl border border-white/5 p-5 flex flex-col items-center justify-center gap-4">
              <Skeleton circle width={140} height={140} />
              <Skeleton width={80} height={14} />
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  const remaining = Math.max(0, FREE_LIMIT - usage.thisMonth);

  return (
    <div>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────
          Mobile:  title row + separate meta row below
          Desktop: original single flex row with everything inline
      ──────────────────────────────────────────────────────────────── */}
      <div className="mb-5 md:mb-8">

        {/* Row 1 — title + desktop badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight">Overview</h1>
            <p className="text-white/40 mt-1 text-xs md:text-base">
              Manage your vault infrastructure.
            </p>
          </div>

          {/* Desktop-only badge (too wide for mobile) */}
          <div className="hidden md:flex items-center px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm shrink-0">
            Free Trial — {FREE_LIMIT.toLocaleString()} req/month
          </div>
        </div>

        {/* Row 2 — live indicator + refresh + mobile badge */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="hidden md:flex items-center gap-2 text-xs text-white/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : "Live"}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsage(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-40"
              title="Refresh now"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Mobile-only compact badge */}
            <div className="md:hidden px-2.5 py-1 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-[11px] shrink-0">
              Free — {FREE_LIMIT.toLocaleString()} req/mo
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────
          Mobile:  2 × 2 grid
          Desktop: 1 × 4 row (original)
      ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <StatCard
          label="Requests This Month"
          value={usage.thisMonth.toLocaleString()}
          sub={`${remaining.toLocaleString()} remaining`}
        />
        <StatCard label="Today" value={usage.today.toLocaleString()} sub="Live usage" />
        <StatCard label="Mask Requests" value={usage.maskCount.toLocaleString()} sub="All-time masks" />
        <StatCard label="Unmask Requests" value={usage.unmaskCount.toLocaleString()} sub="All-time unmask" />
      </div>

      {/* ── CHART + USAGE RING ──────────────────────────────────────────
          Mobile:  stacked (chart full-width, ring full-width below)
          Desktop: chart left, 320 px ring pinned right (original)
      ──────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-6">
        <RequestChart />
        <UsageRing used={usage.thisMonth} limit={FREE_LIMIT} />
      </div>

    </div>
  );
}