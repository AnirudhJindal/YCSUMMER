import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, active: true, requests: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ keys });
}