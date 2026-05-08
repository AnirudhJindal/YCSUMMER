import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { keyId, name } = await req.json();
  if (!keyId || !name) return new Response("Missing keyId or name", { status: 400 });

  await prisma.apiKey.update({
    where: { id: keyId, userId: user.id }, // ✅ scoped to user
    data: { name },
  });

  return Response.json({ success: true });
}