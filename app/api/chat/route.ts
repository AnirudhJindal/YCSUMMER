import { mask } from "@/lib/privacy";
import { createStreamUnmasker } from "@/lib/core/streamUnmask";

export async function POST(req: Request) {
  const { input } = await req.json();

  const { masked, map } = mask(input);

  // mock LLM stream (replace with real OpenAI stream)
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const unmask = createStreamUnmasker(map);

      // simulate streaming chunks
      const chunks = [
        "Processing ",
        masked.slice(0, 10),
        masked.slice(10),
        " done"
      ];

      for (const chunk of chunks) {
        const processed = unmask(chunk);

        controller.enqueue(encoder.encode(processed));

        await new Promise(r => setTimeout(r, 50));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}