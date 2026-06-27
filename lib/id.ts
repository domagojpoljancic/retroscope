export function createId(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

export function isValidId(value: string): boolean {
  return value.trim().length > 0;
}
