import { MaskMap } from "../types/types";

export function unmask(text: string, map: MaskMap): string {
  let result = text;

  for (const token in map) {
    result = result.split(token).join(map[token]);
  }

  return result;
}