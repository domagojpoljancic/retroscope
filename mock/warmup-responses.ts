import { daysAgo } from "@/lib/dates";
import type { WarmupResponse } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

const sessionId = MOCK_IDS.session;
const createdAt = daysAgo(0);

export const mockWarmupResponses: WarmupResponse[] = [
  {
    id: "warmup-alex",
    sessionId,
    participantId: MOCK_IDS.participants.alex,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-focused",
        accessory: "acc-laptop",
        background: "bg-sprint",
      },
      moodLabel: "Ready to facilitate",
    },
    createdAt,
  },
  {
    id: "warmup-marta",
    sessionId,
    participantId: MOCK_IDS.participants.marta,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-happy",
        accessory: "acc-coffee",
        background: "bg-office",
      },
      moodLabel: "Optimistic",
    },
    createdAt,
  },
  {
    id: "warmup-jamie",
    sessionId,
    participantId: MOCK_IDS.participants.jamie,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-calm",
        accessory: "acc-headphones",
        background: "bg-sunrise",
      },
      moodLabel: "Steady",
    },
    createdAt,
  },
  {
    id: "warmup-priya",
    sessionId,
    participantId: MOCK_IDS.participants.priya,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-excited",
        accessory: "acc-plant",
        background: "bg-office",
      },
      moodLabel: "Energized",
    },
    createdAt,
  },
  {
    id: "warmup-tom",
    sessionId,
    participantId: MOCK_IDS.participants.tom,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-tired",
        accessory: "acc-coffee",
        background: "bg-sprint",
      },
      moodLabel: "Needs more sleep",
    },
    createdAt,
  },
  {
    id: "warmup-sara",
    sessionId,
    participantId: MOCK_IDS.participants.sara,
    warmupType: "mood_character",
    response: {
      type: "mood_character",
      characterParts: {
        face: "face-happy",
        accessory: "acc-laptop",
        background: "bg-sunrise",
      },
      moodLabel: "Curious",
    },
    createdAt,
  },
];
