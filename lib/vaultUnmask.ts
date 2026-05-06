import { getMapFromDB } from "@/lib/getMapFromDB";
import { unmask } from "@/lib/core/unmask";
import { prisma } from "@/lib/prisma";

export async function vaultUnmask(text: string, userId: string) {
  const map = await getMapFromDB(text, userId);

  const tokens = Object.keys(map);
  if (tokens.length > 0) {
    await prisma.auditLog.createMany({
      data: tokens.map(token => ({
        userId,
        token,
        action: "unmask",
      })),
    });
  }

  return unmask(text, map);
}