"use client";

import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type UsageData = {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  maskCount: number;
  unmaskCount: number;
};

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch("/api/usage", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch usage");
        setData(await res.json());
      } catch (err) {
        console.error(err);
        setError("Failed to load usage.");
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, []);

  if (loading) {
    return (
      <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a3e">
        <div className="p-8">
          <div className="mb-8">
            <Skeleton width={220} height={36} className="mb-2" />
            <Skeleton width={200} height={16} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <Skeleton width="50%" height={14} className="mb-3" />
                <Skeleton width="70%" height={40} />
              </div>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (error || !data) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  const stats = [
    { label: "Today", value: data.today },
    { label: "This Week", value: data.thisWeek },
    { label: "This Month", value: data.thisMonth },
    { label: "Total Requests", value: data.total },
    { label: "Mask Requests", value: data.maskCount },
    { label: "Unmask Requests", value: data.unmaskCount },
  ];

  return (
    <div className="min-h-screen text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-white/50">API and vault usage statistics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
            <div className="text-sm text-white/45 mb-3">{stat.label}</div>
            <div className="text-4xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}