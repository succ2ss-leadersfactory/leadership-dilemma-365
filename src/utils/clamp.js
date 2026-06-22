export function clamp(value, min = 0, max = 3) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}
