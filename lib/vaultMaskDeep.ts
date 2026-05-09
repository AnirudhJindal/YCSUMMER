import { maskDeep } from "@/lib/core/maskDeep";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import redis from "@/lib/redis";
import crypto from "crypto";

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function vaultMaskDeep(input: unknown, userId: string, keyId?: string) {
  const { masked, map } = maskDeep(input);
  const entries = Object.entries(map);

  if (entries.length > 0) {
    const finalMap: Record<string, string> = {};

    for (const [token, value] of entries) {
      const valueHash = hashValue(value);

      const existing = await prisma.tokenVault.findFirst({
        where: { userId, valueHash },
      });

      if (existing) {
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
            type: token.split("_")[1] || "GENERIC",
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

  return { masked };
}