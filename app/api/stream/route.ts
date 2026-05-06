import { validateApiKey } from "@/lib/auth";
import { getMapFromDB } from "@/lib/getMapFromDB";
import { createStreamUnmasker } from "@/lib/core/streamUnmask";

export async function POST(req: Request) {
  const key = await validateApiKey(req);
  if (!key) return new Response("Unauthorized", { status: 401 });

  // need a sample of the text upfront to extract tokens
  const { text } = await req.json();
  if (!text) return new Response("Missing 'text'", { status: 400 });

  const map = await getMapFromDB(text, key.userId);
  const processChunk = createStreamUnmasker(map);

  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 20;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        const unmasked = processChunk(chunk);
        controller.enqueue(new TextEncoder().encode(unmasked));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}