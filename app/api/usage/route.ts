import { prisma } from "@/lib/prisma";

import { getDashboardUser }
from "@/lib/dashboardAuth";

export async function GET() {
  const user =
    await getDashboardUser();

  if (!user) {
    return new Response(
      "Unauthorized",
      {
        status: 401,
      }
    );
  }

  const now = new Date();

  const todayStart = new Date(
    now.setHours(0, 0, 0, 0)
  );

  const weekStart = new Date(now);

  weekStart.setDate(
    weekStart.getDate() - 7
  );

  const monthStart = new Date(now);

  monthStart.setDate(
    monthStart.getDate() - 30
  );

  const [
    today,
    thisWeek,
    thisMonth,
    total,
    maskCount,
    unmaskCount,
  ] = await Promise.all([
    prisma.auditLog.count({
      where: {
        userId: user.id,

        createdAt: {
          gte: todayStart,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        userId: user.id,

        createdAt: {
          gte: weekStart,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        userId: user.id,

        createdAt: {
          gte: monthStart,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.auditLog.count({
      where: {
        userId: user.id,

        action: "mask",
      },
    }),

    prisma.auditLog.count({
      where: {
        userId: user.id,

        action: "unmask",
      },
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