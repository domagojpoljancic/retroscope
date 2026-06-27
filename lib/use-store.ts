"use client";

import { useSyncExternalStore } from "react";

import type { MockDataState } from "@/mock";
import { getMockStore, subscribeToStore } from "@/services/store";

/**
 * Reactive snapshot of the localStorage-backed mock store.
 *
 * Returns `null` during server rendering and the first client render (the
 * store hydrates from localStorage in the browser), then the live snapshot.
 * Consumers should render a loading state while the value is `null`.
 */
export function useMockStore(): MockDataState | null {
  return useSyncExternalStore<MockDataState | null>(
    subscribeToStore,
    getMockStore,
    () => null,
  );
}
