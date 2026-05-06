import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { keyId } = await req.json();
  if (!keyId) return new Response("Missing keyId", { status: 400 });

  // prevent deleting the key being used to make this request
  if (keyId === key.id)
    return new Response("Cannot delete the key you are using", { status: 400 });

  await prisma.apiKey.delete({
    where: { id: keyId, userId: key.userId },
  });

  return Response.json({ success: true });
}