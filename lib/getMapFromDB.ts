import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import redis from "@/lib/redis";

export async function getMapFromDB(text: string, userId: string) {
  const tokens = [...text.matchAll(/__[A-Z]+_[0-9a-f-]{36}__/g)].map((m) => m[0]);

  if (!tokens.length) return {};

  const map: Record<string, string> = {};

  // Fetch ALL tokens from Redis in parallel using mget
  const cacheKeys = tokens.map((t) => `vault:${userId}:${t}`);
  const cachedValues = await redis.mget(...cacheKeys);

  const missing: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    if (cachedValues[i]) {
      map[tokens[i]] = cachedValues[i] as string;
    } else {
      missing.push(tokens[i]);
    }
  }

  if (!missing.length) return map;

  // Batch DB fetch for missing tokens
  const records = await prisma.tokenVault.findMany({
    where: { token: { in: missing }, userId },
    select: { token: true, realValue: true }, // only fetch what we need
  });

  if (!records.length) return map;

  // Decrypt all and write to Redis in parallel
  const pipeline = redis.pipeline();

  for (const r of records) {
    const value = decrypt(r.realValue);
    map[r.token] = value;
    pipeline.setex(`vault:${userId}:${r.token}`, 3600, value);
  }

  await pipeline.exec(); // all Redis writes in one round trip

  return map;
}