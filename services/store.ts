import { createInitialMockState, type MockDataState } from "@/mock";
import { readFromStorage, writeToStorage } from "@/lib/storage";

const STORE_NAMESPACE = "mock-store-v1";

let memoryState: MockDataState = createInitialMockState();
let hydratedFromStorage = false;

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

export function subscribeToStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function cloneState(state: MockDataState): MockDataState {
  return structuredClone(state);
}

export function getMockStore(): MockDataState {
  // Hydrate from localStorage once on the client. Returning a stable reference
  // afterwards keeps the snapshot cached for `useSyncExternalStore` consumers.
  if (typeof window !== "undefined" && !hydratedFromStorage) {
    memoryState = readFromStorage(STORE_NAMESPACE, memoryState);
    hydratedFromStorage = true;
  }
  return memoryState;
}

export function setMockStore(nextState: MockDataState): MockDataState {
  memoryState = cloneState(nextState);
  writeToStorage(STORE_NAMESPACE, memoryState);
  notifyListeners();
  return memoryState;
}

export function updateMockStore(
  updater: (state: MockDataState) => MockDataState,
): MockDataState {
  const current = getMockStore();
  return setMockStore(updater(current));
}

export function resetMockStore(): MockDataState {
  return setMockStore(createInitialMockState());
}

export function findById<T extends { id: string }>(
  items: T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

export function notFoundError(entity: string, id: string): Error {
  return new Error(`${entity} not found: ${id}`);
}
