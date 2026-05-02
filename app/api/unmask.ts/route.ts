import { NextResponse } from "next/server";
import { unmask } from "@/lib/core/unmask";
import redis from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.json();
  const { text, sessionId } = body;

  if (!text || !sessionId) {
    return NextResponse.json({ error: "text and sessionId are required" }, { status: 400 });
  }

  const raw = await redis.get(sessionId);
  if (!raw) {
    return NextResponse.json({ error: "session not found or expired" }, { status: 404 });
  }

  const map = JSON.parse(raw);
  const final = unmask(text, map);

  return NextResponse.json({ final });
}