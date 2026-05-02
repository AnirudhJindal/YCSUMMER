// lib/privacy/core/maskDeep.ts

import { mask } from "./mask";
import { MaskMap } from "../types/types";

export function maskDeep(
  input: unknown,
  map: MaskMap = {}
): { masked: unknown; map: MaskMap } {

  if (typeof input === "string") {
    const result = mask(input);
    Object.assign(map, result.map);
    return { masked: result.masked, map };
  }

  if (Array.isArray(input)) {
    const masked = input.map((item) => maskDeep(item, map).masked);
    return { masked, map };
  }

  if (typeof input === "object" && input !== null) {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      masked[key] = maskDeep(value, map).masked;
    }
    return { masked, map };
  }

  // numbers, booleans, null — return as-is
  return { masked: input, map };
}