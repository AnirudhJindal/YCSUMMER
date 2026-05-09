"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type DayData = {
  date: string;
  count: number;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const isReal = value > 1 || payload[0].payload.real;

  return (
    <div
      style={{
        background: "rgba(10,10,15,0.95)",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 0 24px rgba(168,85,247,0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4, letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
        {isReal ? value.toLocaleString() : "0"}
        <span style={{ color: "rgba(168,85,247,0.7)", fontSize: 11, fontWeight: 400, marginLeft: 5 }}>
          requests
        </span>
      </div>
    </div>
  );
}

// ── Gradient defs injected into SVG ──────────────────────────────────────────
function GradientDefs() {
  return (
    <defs>
      <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="barGradientInactive" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#4c1d95" stopOpacity={0.15} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export default function RequestChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [flash, setFlash] = useState(false);
  const [prevTotal, setPrevTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await api<DayData[]>("/api/usage/daily");

        const total = res.reduce((s, d) => s + d.count, 0);
        if (total !== prevTotal && prevTotal !== 0) {
          setFlash(true);
          setTimeout(() => setFlash(false), 1000);
        }
        setPrevTotal(total);

        const filled =
          res.length > 0
            ? res.map((d) => ({ ...d, real: d.count > 0 }))
            : Array.from({ length: 7 }).map((_, i) => ({ date: "", count: 0, real: false }));

        setData(filled as any);
      } catch {
        setData(Array.from({ length: 7 }).map(() => ({ date: "", count: 0 })) as any);
      }
    }

    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [prevTotal]);

  const chartData = data.map((d: any, i) => ({
    name: d.date ? DAYS[new Date(d.date + "T00:00:00").getDay()] : DAYS[i],
    value: d.count > 0 ? d.count : 0.3, // ghost bar when 0
    real: d.count > 0,
    raw: d.count,
  }));

  const LIMIT = 5000;
  const maxVal = Math.max(...chartData.map((d) => d.raw), 1);
  // If usage is tiny (<10% of limit) show at 4x actual max so bars are visible
  // but still clearly small. Once usage grows it scales against the full limit.
  const yMax = maxVal < LIMIT * 0.1 ? Math.max(maxVal * 4, 50) : LIMIT;

  return (
    <div
      className="relative rounded-3xl p-6 h-[320px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: flash
          ? "0 0 0 1px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.15)"
          : "0 0 0 1px rgba(255,255,255,0.04)",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* Ambient glow top-right */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white text-sm font-semibold tracking-wide">
            Requests
          </h2>
          <p className="text-white/30 text-xs mt-0.5">Last 7 days</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total badge */}
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.2)",
              color: "#c084fc",
            }}
          >
            {chartData.reduce((s, d) => s + d.raw, 0).toLocaleString()} / 5,000
          </div>

          {/* Live pulse */}
          <div className="relative flex items-center justify-center w-6 h-6">
            <div
              className={`absolute w-full h-full rounded-full ${flash ? "animate-ping" : ""}`}
              style={{ background: "rgba(168,85,247,0.3)" }}
            />
            <div
              className="relative w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                background: "#a855f7",
                boxShadow: "0 0 10px rgba(168,85,247,0.8)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData} barCategoryGap="28%">
          <GradientDefs />

          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />

          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis hide domain={[0, yMax]} />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(168,85,247,0.05)", radius: 8 } as any}
          />

          <Bar
            dataKey="value"
            radius={[10, 10, 4, 4]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  !entry.real
                    ? "rgba(255,255,255,0.04)"
                    : i === chartData.length - 1
                    ? "url(#barGradientActive)"
                    : "url(#barGradientInactive)"
                }
                style={
                  entry.real && i === chartData.length - 1
                    ? { filter: "url(#glow)" }
                    : {}
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}