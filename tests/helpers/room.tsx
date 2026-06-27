import type { ReactElement } from "react";
import { render } from "@testing-library/react";

import {
  SessionRoomProvider,
  type RoomViewer,
  type SessionRoomContextValue,
  type SessionStoreView,
} from "@/components/session-room/session-room-context";
import { getFrameworkColumns } from "@/lib/framework-columns";
import { ToastProvider } from "@/components/ui/toast";
import { makeSession } from "../factories";

function emptyStore(): SessionStoreView {
  return {
    cards: [],
    groups: [],
    groupingEvents: [],
    votes: [],
    votingSettings: [],
    timers: [],
    warmupResponses: [],
    actionSuggestions: [],
    actionItems: [],
  };
}

const defaultViewer: RoomViewer = {
  key: "participant-1",
  label: "Jordan",
  participantId: "participant-1",
  isFacilitator: false,
};

export type RoomOverrides = Partial<
  Omit<SessionRoomContextValue, "store" | "session">
> & {
  session?: Partial<SessionRoomContextValue["session"]>;
  store?: Partial<SessionStoreView>;
};

export function buildRoomValue(
  overrides: RoomOverrides = {},
): SessionRoomContextValue {
  const session = makeSession(overrides.session);
  return {
    session,
    store: { ...emptyStore(), ...overrides.store },
    participants: overrides.participants ?? [],
    columns: overrides.columns ?? getFrameworkColumns(session.frameworkType),
    viewer: overrides.viewer ?? defaultViewer,
    hasActionReview: overrides.hasActionReview ?? false,
    goToPhase: overrides.goToPhase ?? (() => {}),
    advance: overrides.advance ?? (() => {}),
    back: overrides.back ?? (() => {}),
    participantName: overrides.participantName ?? ((id) => id ?? "Someone"),
  };
}

/** Renders a session-room child wrapped in the room + toast providers. */
export function renderInRoom(ui: ReactElement, overrides: RoomOverrides = {}) {
  return render(
    <ToastProvider>
      <SessionRoomProvider value={buildRoomValue(overrides)}>
        {ui}
      </SessionRoomProvider>
    </ToastProvider>,
  );
}
