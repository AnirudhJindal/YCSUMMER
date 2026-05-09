import { NextResponse } from "next/server";
import { mask } from "@/lib/core/mask";
import { unmask } from "@/lib/core/unmask";
import redis from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { text, userId } = await req.json();

  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const { masked, map } = await mask(text, userId);
  const sessionId = uuidv4();
  await redis.set(sessionId, JSON.stringify(map), "EX", 3600);

  const llmOutput = `LLM says: ${masked}`;

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