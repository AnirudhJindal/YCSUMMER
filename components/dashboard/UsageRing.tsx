export default function UsageRing({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const pct = Math.min(
    Math.round((used / limit) * 100),
    100
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="text-white/60 mb-4">
        Monthly Limit
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-[10px] border-violet-500/20">
        <div className="text-center">
          <div className="text-3xl font-bold">
            {pct}%
          </div>

          <div className="text-xs text-white/40 mt-1">
            {used.toLocaleString()} / {limit.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}