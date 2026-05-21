"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  used: number;
  limit: number;
};

function useAnimatedNumber(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * e));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else prevRef.current = to;
    }
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

export default function UsageRing({ used, limit }: Props) {
  const animatedUsed = useAnimatedNumber(used);
  const animatedRemaining = useAnimatedNumber(Math.max(0, limit - used));

  const rawPct = Math.min((used / limit) * 100, 100);
  const pct = Math.round(rawPct * 10) / 10;

  const size = 144;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedPct = useAnimatedNumber(rawPct, 900);
  const arcPct = used > 0 ? Math.max(animatedPct, 2) : 0;
  const offset = circumference - (arcPct / 100) * circumference;

  const ringColor =
    rawPct >= 90 ? "#f43f5e" : rawPct >= 70 ? "#f97316" : "#a78bfa";

  const labelColor =
    rawPct >= 90 ? "text-rose-400" : rawPct >= 70 ? "text-orange-400" : "text-white";

  const [pulse, setPulse] = useState(false);
  const prevUsedRef = useRef(used);
  useEffect(() => {
    if (used !== prevUsedRef.current) {
      prevUsedRef.current = used;
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }
  }, [used]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col items-center justify-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="text-white/60 font-medium text-sm">Monthly Usage</span>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            pulse ? "animate-ping bg-violet-400" : "bg-violet-500/30"
          }`} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
        </span>
      </div>

      {/* Ring — slightly smaller on mobile */}
      <div className="relative" style={{ width: size, height: size }}>
        {pulse && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ boxShadow: `0 0 0 8px ${ringColor}` }}
          />
        )}
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums transition-colors duration-300 ${labelColor}`}>
            {pct < 1 && used > 0 ? "<1" : Math.round(animatedPct)}%
          </span>
          <span className="text-[11px] text-white/30 mt-0.5">used</span>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="w-full grid grid-cols-2 gap-2 text-center">
        <div className={`rounded-xl py-2.5 px-3 transition-all duration-300 ${
          pulse ? "bg-violet-500/10 ring-1 ring-violet-400/30" : "bg-white/[0.04]"
        }`}>
          <div className="text-base font-semibold tabular-nums">{animatedUsed.toLocaleString()}</div>
          <div className="text-[11px] text-white/30 mt-0.5">used</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl py-2.5 px-3">
          <div className="text-base font-semibold tabular-nums text-emerald-400">{animatedRemaining.toLocaleString()}</div>
          <div className="text-[11px] text-white/30 mt-0.5">remaining</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${arcPct}%`, backgroundColor: ringColor, transition: "background-color 0.4s ease" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
          <span>0</span>
          <span>{limit.toLocaleString()} req / mo</span>
        </div>
      </div>
    </div>
  );
}