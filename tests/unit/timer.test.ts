import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  endTimer,
  formatTimerDisplay,
  getRemainingSeconds,
  isTimerExpired,
  pauseTimer,
  resumeTimer,
  startTimer,
} from "@/lib/timer";
import { makeTimer } from "../factories";

describe("formatTimerDisplay", () => {
  it("formats minutes and zero-padded seconds", () => {
    expect(formatTimerDisplay(0)).toBe("0:00");
    expect(formatTimerDisplay(5)).toBe("0:05");
    expect(formatTimerDisplay(65)).toBe("1:05");
    expect(formatTimerDisplay(600)).toBe("10:00");
  });
});

describe("getRemainingSeconds", () => {
  it("returns the full duration before the timer starts", () => {
    const timer = makeTimer({ status: "not_started", durationSeconds: 120 });
    expect(getRemainingSeconds(timer)).toBe(120);
  });

  it("computes remaining time from elapsed while paused", () => {
    const timer = makeTimer({
      status: "paused",
      durationSeconds: 300,
      startedAt: "2024-01-01T00:00:00.000Z",
      pausedAt: "2024-01-01T00:01:00.000Z", // 60s elapsed
    });
    expect(getRemainingSeconds(timer)).toBe(240);
  });

  it("clamps to zero when paused past the duration", () => {
    const timer = makeTimer({
      status: "paused",
      durationSeconds: 30,
      startedAt: "2024-01-01T00:00:00.000Z",
      pausedAt: "2024-01-01T00:01:00.000Z",
    });
    expect(getRemainingSeconds(timer)).toBe(0);
  });
});

describe("running timer with fake clock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down based on endsAt", () => {
    const timer = startTimer(makeTimer({ durationSeconds: 300 }));
    expect(getRemainingSeconds(timer)).toBe(300);
    vi.setSystemTime(new Date("2024-01-01T00:01:00.000Z"));
    expect(getRemainingSeconds(timer)).toBe(240);
  });

  it("reports expiry once the clock passes endsAt", () => {
    const timer = startTimer(makeTimer({ durationSeconds: 60 }));
    expect(isTimerExpired(timer)).toBe(false);
    vi.setSystemTime(new Date("2024-01-01T00:01:01.000Z"));
    expect(isTimerExpired(timer)).toBe(true);
  });
});

describe("timer transitions", () => {
  it("startTimer sets running status and an end time", () => {
    const started = startTimer(makeTimer({ durationSeconds: 120 }), "2024-01-01T00:00:00.000Z");
    expect(started.status).toBe("running");
    expect(started.startedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(started.endsAt).toBe("2024-01-01T00:02:00.000Z");
  });

  it("pauseTimer clears the end time", () => {
    const started = startTimer(makeTimer(), "2024-01-01T00:00:00.000Z");
    const paused = pauseTimer(started, "2024-01-01T00:00:30.000Z");
    expect(paused.status).toBe("paused");
    expect(paused.endsAt).toBeNull();
    expect(paused.pausedAt).toBe("2024-01-01T00:00:30.000Z");
  });

  it("resumeTimer restarts the countdown from the remaining time", () => {
    const started = startTimer(
      makeTimer({ durationSeconds: 300 }),
      "2024-01-01T00:00:00.000Z",
    );
    const paused = pauseTimer(started, "2024-01-01T00:01:00.000Z"); // 240 remaining
    const resumed = resumeTimer(paused, "2024-01-01T00:05:00.000Z");
    expect(resumed.status).toBe("running");
    expect(resumed.endsAt).toBe("2024-01-01T00:09:00.000Z");
  });

  it("endTimer marks the timer ended and expired", () => {
    const ended = endTimer(makeTimer({ status: "running" }));
    expect(ended.status).toBe("ended");
    expect(isTimerExpired(ended)).toBe(true);
  });
});
