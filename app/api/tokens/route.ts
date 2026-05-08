import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const tokens = await prisma.tokenVault.findMany({
    where: { userId: user.id },
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
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { tokenId } = await req.json();
  if (!tokenId) return new Response("Missing tokenId", { status: 400 });

  await prisma.tokenVault.delete({
    where: { id: tokenId, userId: user.id },
  });

  return Response.json({ success: true });
}