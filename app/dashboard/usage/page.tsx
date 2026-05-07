"use client";

import { useEffect, useState } from "react";

type UsageData = {
  today: number;

  thisWeek: number;

  thisMonth: number;

  total: number;

  maskCount: number;

  unmaskCount: number;
};

export default function UsagePage() {
  const [data, setData] =
    useState<UsageData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch(
          "/api/usage",
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to fetch usage"
          );
        }

        const json =
          await res.json();

        setData(json);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load usage."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading usage...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  const stats = [
    {
      label: "Today",
      value: data.today,
    },

    {
      label: "This Week",
      value: data.thisWeek,
    },

    {
      label: "This Month",
      value: data.thisMonth,
    },

    {
      label: "Total Requests",
      value: data.total,
    },

    {
      label: "Mask Requests",
      value: data.maskCount,
    },

    {
      label: "Unmask Requests",
      value: data.unmaskCount,
    },
  ];

  return (
    <div className="min-h-screen text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Usage Analytics
        </h1>

        <p className="text-white/50">
          API and vault usage
          statistics.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
              p-6
            "
          >
            <div className="text-sm text-white/45 mb-3">
              {stat.label}
            </div>

            <div className="text-4xl font-bold">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}