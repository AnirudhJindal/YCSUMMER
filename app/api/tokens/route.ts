import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const tokens = await prisma.tokenVault.findMany({
    where: { userId: key.userId },
    select: {
      id: true,
      token: true,
      type: true,
      createdAt: true,
      lastUsed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ tokens });
}

export async function DELETE(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { tokenId } = await req.json();
  if (!tokenId) return new Response("Missing tokenId", { status: 400 });

  await prisma.tokenVault.delete({
    where: { id: tokenId, userId: key.userId },
  });

  return Response.json({ success: true });
}