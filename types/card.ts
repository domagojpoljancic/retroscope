export interface RetroCard {
  id: string;
  sessionId: string;
  participantId: string;
  frameworkColumn: string;
  text: string;
  isRevealed: boolean;
  revealedAt: string | null;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
