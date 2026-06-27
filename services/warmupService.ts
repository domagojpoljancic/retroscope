import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import {
  CHARACTER_BUILDER_PARTS,
  THIS_OR_THAT_PROMPTS,
  TRIVIA_QUESTIONS,
  checkTriviaAnswer,
} from "@/lib/warmup-content";
import type {
  CharacterBuilderPart,
  ThisOrThatPrompt,
  TriviaQuestion,
  WarmupResponse,
  WarmupResponseData,
  WarmupType,
} from "@/types";
import { getMockStore, updateMockStore } from "@/services/store";

export interface SubmitWarmupResponseInput {
  sessionId: string;
  participantId: string;
  warmupType: WarmupType;
  response: WarmupResponseData;
}

export const warmupService = {
  getThisOrThatPrompts(): ThisOrThatPrompt[] {
    return THIS_OR_THAT_PROMPTS;
  },

  getTriviaQuestions(): TriviaQuestion[] {
    return TRIVIA_QUESTIONS;
  },

  getCharacterBuilderParts(): CharacterBuilderPart[] {
    return CHARACTER_BUILDER_PARTS;
  },

  listResponsesBySession(sessionId: string): WarmupResponse[] {
    return getMockStore().warmupResponses.filter(
      (response) => response.sessionId === sessionId,
    );
  },

  getResponseForParticipant(
    sessionId: string,
    participantId: string,
  ): WarmupResponse | null {
    return (
      getMockStore().warmupResponses.find(
        (response) =>
          response.sessionId === sessionId &&
          response.participantId === participantId,
      ) ?? null
    );
  },

  submitResponse(input: SubmitWarmupResponseInput): WarmupResponse {
    const existing = warmupService.getResponseForParticipant(
      input.sessionId,
      input.participantId,
    );

    if (existing) {
      const updated: WarmupResponse = {
        ...existing,
        warmupType: input.warmupType,
        response: input.response,
      };

      updateMockStore((state) => ({
        ...state,
        warmupResponses: state.warmupResponses.map((response) =>
          response.id === existing.id ? updated : response,
        ),
      }));

      return updated;
    }

    const response: WarmupResponse = {
      id: createId("warmup"),
      sessionId: input.sessionId,
      participantId: input.participantId,
      warmupType: input.warmupType,
      response: input.response,
      createdAt: nowIso(),
    };

    updateMockStore((state) => ({
      ...state,
      warmupResponses: [...state.warmupResponses, response],
    }));

    return response;
  },

  buildGuessingGameResponse(
    questionId: string,
    answer: string,
  ): WarmupResponseData {
    return {
      type: "guessing_game",
      questionId,
      answer,
      isCorrect: checkTriviaAnswer(questionId, answer),
    };
  },
};
