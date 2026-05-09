import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { mask } from "@/lib/core/mask";
import redis from "@/lib/redis";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function vaultMask(text: string, userId: string, keyId?: string) {
  const { masked, map } = await mask(text, userId, keyId);
  const entries = Object.entries(map);

  if (entries.length === 0) return masked;

  // Step 1: Compute all hashes upfront
  const hashed = entries.map(([token, value]) => ({
    token,
    value,
    valueHash: hashValue(value),
  }));

  // Step 2: Batch fetch all existing vault entries in ONE query
  const existingEntries = await prisma.tokenVault.findMany({
    where: {
      userId,
      valueHash: { in: hashed.map((h) => h.valueHash) },
    },
  });

  const existingMap = new Map(existingEntries.map((e) => [e.valueHash, e]));

  // Step 3: Separate into creates and updates
  const toCreate: typeof hashed = [];
  const toUpdate: { id: string; token: string; value: string }[] = [];
  const tokenRemaps: { oldToken: string; newToken: string }[] = [];

  for (const { token, value, valueHash } of hashed) {
    const existing = existingMap.get(valueHash);
    if (existing) {
      toUpdate.push({ id: existing.id, token: existing.token, value });
      tokenRemaps.push({ oldToken: token, newToken: existing.token });
    } else {
      toCreate.push({ token, value, valueHash });
    }
  }

  // Step 4: Apply token remaps to masked text
  let finalMasked = masked;
  for (const { oldToken, newToken } of tokenRemaps) {
    finalMasked = finalMasked.replaceAll(oldToken, newToken);
  }

  // Step 5: Run all DB writes and Redis sets in parallel
  await Promise.all([
    // Batch update lastUsed for existing tokens
    toUpdate.length > 0
      ? prisma.tokenVault.updateMany({
          where: { id: { in: toUpdate.map((u) => u.id) } },
          data: { lastUsed: new Date() },
        })
      : Promise.resolve(),

    // Batch create new tokens
    toCreate.length > 0
      ? prisma.tokenVault.createMany({
          data: toCreate.map(({ token, value, valueHash }) => ({
            token,
            userId,
            realValue: encrypt(value),
            valueHash,
            type: token.split("_")[2] || "GENERIC",
            lastUsed: new Date(),
          })),
          skipDuplicates: true,
        })
      : Promise.resolve(),

    // Batch Redis sets for existing tokens
    ...toUpdate.map(({ token, value }) =>
      redis.set(`vault:${userId}:${token}`, value, "EX", 3600)
    ),

    // Batch Redis sets for new tokens
    ...toCreate.map(({ token, value }) =>
      redis.set(`vault:${userId}:${token}`, value, "EX", 3600)
    ),
  ]);

  // Step 6: Audit log — batch insert all at once
  const allTokens = [
    ...toUpdate.map((u) => u.token),
    ...toCreate.map((c) => c.token),
  ];

  if (allTokens.length > 0) {
    await prisma.auditLog.createMany({
      data: allTokens.map((token) => ({
        userId,
        token,
        action: "mask",
      })),
    });
  }

  return finalMasked;
}