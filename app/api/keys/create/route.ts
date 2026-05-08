import { getDashboardUser } from "@/lib/dashboardAuth";
import { generateApiKey } from "@/lib/apiKey";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getDashboardUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { name } = await req.json();
  if (!name) return new Response("Missing name", { status: 400 });

  const { raw, hash } = generateApiKey();

  await prisma.apiKey.create({
    data: { userId: user.id, keyHash: hash, name },
  });

  return Response.json({ apiKey: raw });
}