import { matchKeyword } from "./fuzzy";

export function resolveContextType(text: string, index: number) {
  const window = text.slice(Math.max(0, index - 40), index).toLowerCase();
  const words = window.split(/\s+/).reverse();

  for (const word of words) {
    const type = matchKeyword(word);
    if (type) return type;
  }

  return null;
}