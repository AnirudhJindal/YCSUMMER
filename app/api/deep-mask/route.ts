import { validateApiKey } from "@/lib/auth";
import { vaultMaskDeep } from "@/lib/vaultMaskDeep";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  if (!body) return new Response("Missing body", { status: 400 });

  const result = await vaultMaskDeep(body, key.userId, key.id); // ✅ keyId

  return Response.json(result);
}