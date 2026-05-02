import { matchKeyword } from "./fuzzy";

export function buildKeywordQueue(text: string) {
  const queue: { type: string; index: number }[] = [];
  let lastType: string | null = null;

  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const index = match.index;
    const type = matchKeyword(word.toLowerCase());

    if (type && type !== lastType) {
      queue.push({ type, index });
      lastType = type;
    }
  }

  return queue;
}