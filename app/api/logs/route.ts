import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const logs = await prisma.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ logs });
}