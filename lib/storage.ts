const STORAGE_PREFIX = "retroscope:";

export function getStorageKey(namespace: string): string {
  return `${STORAGE_PREFIX}${namespace}`;
}

export function readFromStorage<T>(namespace: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(namespace));
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeToStorage<T>(namespace: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(namespace), JSON.stringify(value));
}

export function clearStorage(namespace: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getStorageKey(namespace));
}
