const bars = [40, 65, 55, 82, 35, 74, 92];

export default function RequestChart() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="text-white/70 mb-6">Requests — Last 7 Days</div>

      <div className="flex items-end gap-3 h-[180px]">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`w-full rounded-t-xl ${
                i === bars.length - 1
                  ? "bg-gradient-to-t from-fuchsia-500 to-violet-500"
                  : "bg-violet-400/30"
              }`}
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );}