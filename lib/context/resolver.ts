export function resolveTypeFromQueue(
  queue: { type: string; index: number }[],
  valueIndex: number
) {
  const MAX_DISTANCE = 80;

  const candidates = queue.filter(item => {
    const dist = valueIndex - item.index;
    return dist >= 0 && dist <= MAX_DISTANCE;
  });

  if (candidates.length === 0) return null;

  // take the first keyword in text order, not the nearest
  const chosen = candidates.reduce((a, b) => a.index < b.index ? a : b);

  const idx = queue.indexOf(chosen);
  if (idx !== -1) queue.splice(idx, 1);

  return chosen.type;
}