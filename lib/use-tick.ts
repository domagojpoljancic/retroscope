"use client";

import { useEffect, useState } from "react";

/**
 * Forces a re-render on a fixed interval. Useful for live countdown timers
 * that derive their remaining time from timestamps in the mock store.
 */
export function useTick(active: boolean, intervalMs = 1000): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const id = window.setInterval(() => {
      setTick((value) => value + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);

  return tick;
}
