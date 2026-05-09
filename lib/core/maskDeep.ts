import { mask } from "./mask";
import { MaskMap } from "../types/types";

export async function maskDeep(
  input: unknown,
  userId: string,
  keyId?: string,
  map: MaskMap = {}
): Promise<{ masked: unknown; map: MaskMap }> {

  if (typeof input === "string") {
    const result = await mask(input, userId, keyId);
    Object.assign(map, result.map);
    return { masked: result.masked, map };
  }

  if (Array.isArray(input)) {
    const masked = await Promise.all(
      input.map((item) => maskDeep(item, userId, keyId, map).then((r) => r.masked))
    );
    return { masked, map };
  }

  if (typeof input === "object" && input !== null) {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      masked[key] = (await maskDeep(value, userId, keyId, map)).masked;
    }
    return { masked, map };
  }

  return { masked: input, map };
}