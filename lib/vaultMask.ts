// lib/vaultMask.ts

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { mask } from "@/lib/core/mask"; // your file

export async function vaultMask(text: string, userId: string) {
  const { masked, map } = mask(text);

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
  }

  return masked;
}