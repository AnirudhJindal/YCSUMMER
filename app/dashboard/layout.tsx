import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      h-screen + overflow-hidden on the root = the body never scrolls.
      Only <main> scrolls (overflow-y-auto). The sidebar is a sibling of
      <main>, so it never enters the scroll container and never moves.
    */
    <div className="h-screen bg-[#0b0b14] text-white relative overflow-hidden">
      {/* ─── Ambient background glows ─── */}
      <div className="absolute top-[-120px] left-[-100px] w-[340px] h-[340px] bg-violet-700/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[220px] h-[220px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />

        {/*
          h-full so it fills the screen-height container above.
          overflow-y-auto so only this column scrolls.
          Mobile: pt-[66px] clears the fixed top navbar.
          Desktop: p-8 as original.
        */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 pt-[66px] pb-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}