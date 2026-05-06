import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: key.userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          apiKeys: true,
          tokens: true,
          logs: true,
        },
      },
    },
  });

  return Response.json({ user });
}

export async function DELETE(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  // delete everything for this user
  await prisma.auditLog.deleteMany({ where: { userId: key.userId } });
  await prisma.tokenVault.deleteMany({ where: { userId: key.userId } });
  await prisma.apiKey.deleteMany({ where: { userId: key.userId } });
  await prisma.user.delete({ where: { id: key.userId } });

  return Response.json({ success: true });
}