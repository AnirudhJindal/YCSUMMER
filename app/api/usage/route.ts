import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);

  const [today, thisWeek, thisMonth, total, maskCount, unmaskCount] =
    await Promise.all([
      prisma.auditLog.count({
        where: { userId: key.userId, createdAt: { gte: todayStart } },
      }),
      prisma.auditLog.count({
        where: { userId: key.userId, createdAt: { gte: weekStart } },
      }),
      prisma.auditLog.count({
        where: { userId: key.userId, createdAt: { gte: monthStart } },
      }),
      prisma.auditLog.count({
        where: { userId: key.userId },
      }),
      prisma.auditLog.count({
        where: { userId: key.userId, action: "mask" },
      }),
      prisma.auditLog.count({
        where: { userId: key.userId, action: "unmask" },
      }),
    ]);

  return Response.json({
    today,
    thisWeek,
    thisMonth,
    total,
    maskCount,
    unmaskCount,
  });
}