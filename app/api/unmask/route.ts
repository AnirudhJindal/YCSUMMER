import { validateApiKey } from "@/lib/auth";
import { vaultUnmask } from "@/lib/vaultUnmask";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  const { text } = await req.json();
  if (!text || typeof text !== "string")
    return new Response("Missing 'text'", { status: 400 });

  const result = await vaultUnmask(text, key.userId);
  return Response.json({ text: result });
}