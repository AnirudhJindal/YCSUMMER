import { validateApiKey } from "@/lib/auth";
import { generateApiKey } from "@/lib/apiKey";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { name } = await req.json();
  if (!name) return new Response("Missing name", { status: 400 });

  const { raw, hash } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId: key.userId,
      keyHash: hash,
      name,
    },
  });

  return Response.json({ apiKey: raw });
}