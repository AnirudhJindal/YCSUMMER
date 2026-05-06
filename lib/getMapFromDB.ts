import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import redis from "@/lib/redis";

export async function getMapFromDB(text: string, userId: string) {
  // your tokens look like __PAN_uuid__ so we need this regex
  const tokens = [...text.matchAll(/__[A-Z]+_[0-9a-f-]{36}__/g)].map(m => m[0]);

  if (!tokens.length) return {};

  const map: Record<string, string> = {};

  // check Redis first
  for (const token of tokens) {
    const cached = await redis.get(`vault:${userId}:${token}`);
    if (cached) map[token] = cached;
  }

  const missing = tokens.filter(t => !map[t]);
  if (!missing.length) return map;

  // fall back to DB
  const records = await prisma.tokenVault.findMany({
    where: { token: { in: missing }, userId },
  });

  for (const r of records) {
    const value = decrypt(r.realValue);
    map[r.token] = value;
    await redis.set(`vault:${userId}:${r.token}`, value, "EX", 3600);
  }

  return map;
}