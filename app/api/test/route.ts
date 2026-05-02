import { NextResponse } from "next/server";
import { mask } from "@/lib/core/mask";
import { unmask } from "@/lib/core/unmask";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  // mask
  const { masked, map } = mask(text);
  const sessionId = uuidv4();
  await redis.set(sessionId, JSON.stringify(map), "EX", 3600);

  // simulate LLM just echoing back (replace with real LLM call to test)
  const llmOutput = `LLM says: ${masked}`;

  // unmask
  const rawMap = await redis.get(sessionId);
  const parsedMap = JSON.parse(rawMap!);
  const final = unmask(llmOutput, parsedMap);

  return NextResponse.json({
    input: text,
    masked,
    map,
    llmOutput,
    final,
  });
}