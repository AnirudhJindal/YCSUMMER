export function splitIntoSegments(text: string) {
  return text
    .split(/(?:\band\b|,)/gi)
    .map(s => s.trim())
    .filter(Boolean);
}