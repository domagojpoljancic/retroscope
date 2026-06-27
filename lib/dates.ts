export function nowIso(): string {
  return new Date().toISOString();
}

export function addSeconds(isoDate: string, seconds: number): string {
  return new Date(new Date(isoDate).getTime() + seconds * 1000).toISOString();
}

export function isPast(isoDate: string): boolean {
  return new Date(isoDate).getTime() <= Date.now();
}

export function formatDueDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
