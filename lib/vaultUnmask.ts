import { getMapFromDB } from "@/lib/getMapFromDB";
import { unmask } from "@/lib/core/unmask";

export async function vaultUnmask(text: string, userId: string) {
  const map = await getMapFromDB(text, userId);
  return unmask(text, map);
}