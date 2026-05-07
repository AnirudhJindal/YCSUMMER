import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b14] text-white overflow-hidden relative">
      <div className="absolute top-[-120px] left-[-100px] w-[340px] h-[340px] bg-violet-700/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-fuchsia-600/20 blur-[120px] rounded-full" />
      <div className="absolute top-[30%] left-[40%] w-[220px] h-[220px] bg-blue-600/20 blur-[100px] rounded-full" />

      <div className="relative z-10 flex">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}