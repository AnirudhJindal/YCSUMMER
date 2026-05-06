import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: key.userId },
    select: {
      id: true,
      name: true,
      active: true,
      requests: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ keys });
}