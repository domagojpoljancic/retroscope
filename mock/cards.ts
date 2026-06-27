import { daysAgo } from "@/lib/dates";
import type { RetroCard } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

const sessionId = MOCK_IDS.session;
const revealedAt = daysAgo(0);

function card(
  id: string,
  participantId: string,
  frameworkColumn: string,
  text: string,
  groupId: string | null = null,
): RetroCard {
  const createdAt = daysAgo(0);
  return {
    id,
    sessionId,
    participantId,
    frameworkColumn,
    text,
    isRevealed: true,
    revealedAt,
    groupId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
}

export const mockRetroCards: RetroCard[] = [
  // Start
  card("card-1", MOCK_IDS.participants.marta, "start", "Pair on sprint planning earlier in the week"),
  card("card-2", MOCK_IDS.participants.jamie, "start", "Add a lightweight release readiness checklist"),
  card("card-3", MOCK_IDS.participants.priya, "start", "Share dependency updates in #platform-risks"),
  card("card-4", MOCK_IDS.participants.sara, "start", "Run a 15-minute pre-refinement sync"),
  // Stop
  card("card-5", MOCK_IDS.participants.tom, "stop", "Starting large stories without clear acceptance criteria"),
  card("card-6", MOCK_IDS.participants.alex, "stop", "Last-minute scope changes after planning lock"),
  card("card-7", MOCK_IDS.participants.marta, "stop", "Skipping rollback drills before major releases"),
  // Continue
  card("card-8", MOCK_IDS.participants.jamie, "continue", "Daily async updates in the team channel"),
  card("card-9", MOCK_IDS.participants.priya, "continue", "Rotating facilitator for internal demos"),
  card("card-10", MOCK_IDS.participants.sara, "continue", "Using the shared incident review template"),
  card("card-11", MOCK_IDS.participants.tom, "continue", "Blocking focus time before release week"),
  // Grouped cards
  card(
    "card-12",
    MOCK_IDS.participants.alex,
    "start",
    "Document sprint goals in one visible place",
    MOCK_IDS.groups.planningClarity,
  ),
  card(
    "card-13",
    MOCK_IDS.participants.marta,
    "stop",
    "Unclear ownership on cross-team dependencies",
    MOCK_IDS.groups.planningClarity,
  ),
  card(
    "card-14",
    MOCK_IDS.participants.jamie,
    "start",
    "Automate smoke tests in the staging pipeline",
    MOCK_IDS.groups.releaseReadiness,
  ),
  card(
    "card-15",
    MOCK_IDS.participants.priya,
    "continue",
    "Post-release verification with on-call rotation",
    MOCK_IDS.groups.releaseReadiness,
  ),
];
