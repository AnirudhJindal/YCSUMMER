import { maskDeep } from "@/lib/core/maskDeep";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import redis from "@/lib/redis";

export async function vaultMaskDeep(input: unknown, userId: string) {
  const { masked, map } = maskDeep(input);
  const entries = Object.entries(map);

  if (entries.length > 0) {
    await prisma.tokenVault.createMany({
      data: entries.map(([token, value]) => ({
        token,
        realValue: encrypt(value),
        type: token.split("_")[1] || "GENERIC",
        userId,
        lastUsed: new Date(),
      })),
      skipDuplicates: true,
    });

    for (const [token, value] of entries) {
      await redis.set(`vault:${userId}:${token}`, value, "EX", 3600);
    }

    await prisma.auditLog.createMany({
      data: entries.map(([token]) => ({
        userId,
        token,
        action: "mask",
      })),
    });
  }

  return { masked };
}