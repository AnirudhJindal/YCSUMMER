export default function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6">
      {children}
    </div>
  );
}