import GlassCard from "./GlassCard";

export default function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <GlassCard>
      <div className="text-sm text-white/40 mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-violet-300 mt-2">{sub}</div>
    </GlassCard>
  );
}