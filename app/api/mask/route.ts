import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { mask } from "@/lib/core/mask";
import redis from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.json();
  const { text } = body;

  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const { masked, map } = mask(text);
  const sessionId = uuidv4();

  await redis.set(sessionId, JSON.stringify(map), "EX", 3600);

  return NextResponse.json({ masked, sessionId });
}