import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { mask } from "@/lib/core/mask";
import redis from "@/lib/redis";

export async function vaultMask(text: string, userId: string, keyId?: string) {
  const { masked, map } = await mask(text, userId, keyId); // ✅ pass keyId
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

  return masked;
}