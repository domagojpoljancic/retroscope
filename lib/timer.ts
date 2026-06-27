import { addSeconds, nowIso } from "@/lib/dates";
import type { TimerState } from "@/types";

export function getRemainingSeconds(timer: TimerState): number {
  // A paused timer has no endsAt, so its remaining time is derived from how
  // much elapsed between starting and pausing. This must be checked before the
  // endsAt guard below, otherwise paused timers would report their full
  // duration and lose progress on resume.
  if (timer.status === "paused" && timer.pausedAt && timer.startedAt) {
    const elapsed =
      new Date(timer.pausedAt).getTime() - new Date(timer.startedAt).getTime();
    return Math.max(timer.durationSeconds - Math.floor(elapsed / 1000), 0);
  }

  if (timer.status === "not_started" || !timer.endsAt) {
    return timer.durationSeconds;
  }

  const remaining = Math.floor(
    (new Date(timer.endsAt).getTime() - Date.now()) / 1000,
  );
  return Math.max(remaining, 0);
}

export function isTimerExpired(timer: TimerState): boolean {
  return timer.status === "ended" || getRemainingSeconds(timer) <= 0;
}

export function startTimer(timer: TimerState, startedAt = nowIso()): TimerState {
  return {
    ...timer,
    status: "running",
    startedAt,
    pausedAt: null,
    endsAt: addSeconds(startedAt, timer.durationSeconds),
  };
}

export function pauseTimer(timer: TimerState, pausedAt = nowIso()): TimerState {
  return {
    ...timer,
    status: "paused",
    pausedAt,
    endsAt: null,
  };
}

export function resumeTimer(timer: TimerState, resumedAt = nowIso()): TimerState {
  const remaining = getRemainingSeconds(timer);
  return {
    ...timer,
    status: "running",
    startedAt: resumedAt,
    pausedAt: null,
    endsAt: addSeconds(resumedAt, remaining),
  };
}

export function endTimer(timer: TimerState, endedAt = nowIso()): TimerState {
  return {
    ...timer,
    status: "ended",
    pausedAt: null,
    endsAt: endedAt,
  };
}

export function formatTimerDisplay(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
