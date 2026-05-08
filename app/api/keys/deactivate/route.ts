import { getDashboardUser } from "@/lib/dashboardAuth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { keyId } = await req.json();
  if (!keyId) return new Response("Missing keyId", { status: 400 });

  await prisma.apiKey.update({
    where: { id: keyId, userId: user.id }, // ✅ scoped to user
    data: { active: false },
  });

  return Response.json({ success: true });
}