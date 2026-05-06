import { validateApiKey } from "@/lib/auth";
import { vaultMaskDeep } from "@/lib/vaultMaskDeep";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const result = await vaultMaskDeep(body, key.userId);
  return Response.json(result);
}