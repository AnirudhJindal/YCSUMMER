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

  let finalMasked = masked;

  if (entries.length > 0) {
    const finalMap: Record<string, string> = {};

    for (const [token, value] of entries) {
      const valueHash = hashValue(value);

      const existing = await prisma.tokenVault.findFirst({
        where: { userId, valueHash },
      });

      if (existing) {
        finalMasked = finalMasked.replaceAll(token, existing.token);
        finalMap[existing.token] = value;

        await prisma.tokenVault.update({
          where: { id: existing.id },
          data: { lastUsed: new Date() },
        });
        await redis.set(`vault:${userId}:${existing.token}`, value, "EX", 3600);
      } else {
        finalMap[token] = value;
        await prisma.tokenVault.create({
          data: {
            token,
            userId,
            realValue: encrypt(value),
            valueHash,
            type: token.split("_")[2] || "GENERIC",
            lastUsed: new Date(),
          },
        });
        await redis.set(`vault:${userId}:${token}`, value, "EX", 3600);
      }
    }

    await prisma.auditLog.createMany({
      data: Object.keys(finalMap).map((token) => ({
        userId,
        token,
        action: "mask",
      })),
    });
  }

  return finalMasked;
}