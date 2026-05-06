import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const logs = await prisma.auditLog.findMany({
    where: { userId: key.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ logs });
}