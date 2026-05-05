import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apiKey";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return new Response("Email required", { status: 400 });
  }

  // create user
  const user = await prisma.user.create({
    data: { email },
  });

  // generate api key
  const { raw, hash } = generateApiKey();

  // store hash
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      keyHash: hash,
      name: "default",
    },
  });

  return Response.json({
    apiKey: raw, // only time user sees this
  });
}