import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { endTimer, pauseTimer, resumeTimer, startTimer } from "@/lib/timer";
import type { TimerPhase, TimerState } from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface CreateTimerInput {
  sessionId: string;
  phase: TimerPhase;
  durationSeconds: number;
}

export const timerService = {
  listBySession(sessionId: string): TimerState[] {
    return getMockStore().timers.filter((timer) => timer.sessionId === sessionId);
  },

  getByPhase(sessionId: string, phase: TimerPhase): TimerState | null {
    return (
      getMockStore().timers.find(
        (timer) => timer.sessionId === sessionId && timer.phase === phase,
      ) ?? null
    );
  },

  getById(timerId: string): TimerState | null {
    return findById(getMockStore().timers, timerId) ?? null;
  },

  create(input: CreateTimerInput): TimerState {
    const timer: TimerState = {
      id: createId("timer"),
      sessionId: input.sessionId,
      phase: input.phase,
      durationSeconds: input.durationSeconds,
      startedAt: null,
      pausedAt: null,
      endsAt: null,
      status: "not_started",
    };

    updateMockStore((state) => ({
      ...state,
      timers: [...state.timers, timer],
    }));

    return timer;
  },

  upsert(input: CreateTimerInput): TimerState {
    const existing = timerService.getByPhase(input.sessionId, input.phase);
    if (existing) {
      return timerService.updateDuration(existing.id, input.durationSeconds);
    }
    return timerService.create(input);
  },

  updateDuration(timerId: string, durationSeconds: number): TimerState {
    let updated: TimerState | null = null;

    updateMockStore((state) => {
      const timers = state.timers.map((timer) => {
        if (timer.id !== timerId) {
          return timer;
        }
        updated = { ...timer, durationSeconds };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Timer", timerId);
      }

      return { ...state, timers };
    });

    return updated!;
  },

  start(timerId: string): TimerState {
    return timerService.applyTransition(timerId, startTimer);
  },

  pause(timerId: string): TimerState {
    return timerService.applyTransition(timerId, pauseTimer);
  },

  resume(timerId: string): TimerState {
    return timerService.applyTransition(timerId, resumeTimer);
  },

  end(timerId: string): TimerState {
    return timerService.applyTransition(timerId, endTimer);
  },

  applyTransition(
    timerId: string,
    transform: (timer: TimerState) => TimerState,
  ): TimerState {
    let updated: TimerState | null = null;

    updateMockStore((state) => {
      const timers = state.timers.map((timer) => {
        if (timer.id !== timerId) {
          return timer;
        }
        updated = transform(timer);
        return updated;
      });

      if (!updated) {
        throw notFoundError("Timer", timerId);
      }

      return { ...state, timers };
    });

    return updated!;
  },
};
