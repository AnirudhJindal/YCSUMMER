import { prisma } from "./prisma";
import { createHash } from "crypto";

export async function validateApiKey(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const raw = auth.replace("Bearer ", "");
  const hash = createHash("sha256").update(raw).digest("hex");

  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
  });

  if (!key || !key.active) return null;
  return key;
}