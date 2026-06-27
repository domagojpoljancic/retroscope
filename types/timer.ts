import type { TimerPhase, TimerStatus } from "@/types/enums";

export interface TimerState {
  id: string;
  sessionId: string;
  phase: TimerPhase;
  durationSeconds: number;
  startedAt: string | null;
  pausedAt: string | null;
  endsAt: string | null;
  status: TimerStatus;
}
