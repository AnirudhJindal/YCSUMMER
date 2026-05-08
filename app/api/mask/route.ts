import { validateApiKey } from "@/lib/auth";
import { vaultMask } from "@/lib/vaultMask";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const result = await vaultMask(body.text, key.userId, key.id); // ✅ pass key.id

  await prisma.auditLog.create({
    data: {
      userId: key.userId,
      token: "mask",
      action: "mask",
    },
  });

  return Response.json(result);
}