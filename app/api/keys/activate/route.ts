import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { keyId } = await req.json();
  if (!keyId) return new Response("Missing keyId", { status: 400 });

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { active: true },
  });

  return Response.json({ success: true });
}