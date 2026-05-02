import { createStreamUnmasker } from "@/lib/core/streamUnmask";
import redis from "@/lib/redis";

export async function POST(req: Request) {
  const sessionId = req.headers.get("x-session-id");

  if (!sessionId) {
    return new Response("x-session-id header is required", { status: 400 });
  }

  const raw = await redis.get(sessionId);
  if (!raw) {
    return new Response("session not found or expired", { status: 404 });
  }

  const map = JSON.parse(raw);
  const processChunk = createStreamUnmasker(map);

  const stream = new ReadableStream({
    async start(controller) {
      const reader = req.body?.getReader();
      if (!reader) { controller.close(); return; }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
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