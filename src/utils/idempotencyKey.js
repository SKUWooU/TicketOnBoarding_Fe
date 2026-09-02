export function createIdempotencyKey(prefix) {
  const randomValue = globalThis.crypto?.randomUUID?.();
  const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${randomValue ?? fallback}`;
}
