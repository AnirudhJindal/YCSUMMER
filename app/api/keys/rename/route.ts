import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { keyId, name } = await req.json();
  if (!keyId || !name) return new Response("Missing keyId or name", { status: 400 });

  await prisma.apiKey.update({
    where: { id: keyId, userId: key.userId },
    data: { name },
  });

  return Response.json({ success: true });
}