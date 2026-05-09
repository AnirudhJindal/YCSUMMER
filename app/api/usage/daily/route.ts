import { prisma } from "@/lib/prisma";
import { getDashboardUser } from "@/lib/dashboardAuth";

export async function GET() {
  const user = await getDashboardUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Build array of last 7 days (oldest → today)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const counts = await Promise.all(
    days.map((dayStart) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      return prisma.auditLog.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
    })
  );

  const result = days.map((d, i) => ({
    date: d.toISOString().split("T")[0], // "2026-05-03"
    count: counts[i],
  }));

  return Response.json(result);
}