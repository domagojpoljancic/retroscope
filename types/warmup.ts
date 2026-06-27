import type { WarmupType } from "@/types/enums";

export interface MoodCharacterParts {
  face: string;
  accessory?: string;
  background?: string;
}

export interface MoodCharacterWarmupResponseData {
  type: "mood_character";
  characterParts: MoodCharacterParts;
  moodLabel?: string;
}

export interface ThisOrThatWarmupResponseData {
  type: "this_or_that";
  promptId: string;
  choice: "a" | "b";
}

export interface GuessingGameWarmupResponseData {
  type: "guessing_game";
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

export type WarmupResponseData =
  | MoodCharacterWarmupResponseData
  | ThisOrThatWarmupResponseData
  | GuessingGameWarmupResponseData;

export interface WarmupResponse {
  id: string;
  sessionId: string;
  participantId: string;
  warmupType: WarmupType;
  response: WarmupResponseData;
  createdAt: string;
}

export interface ThisOrThatPrompt {
  id: string;
  optionA: string;
  optionB: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  answer: string;
  hint?: string;
}

export interface CharacterBuilderPart {
  id: string;
  category: "face" | "accessory" | "background";
  label: string;
  emoji: string;
}
