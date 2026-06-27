export { actionBoardService } from "@/services/actionBoardService";
export { actionService } from "@/services/actionService";
export { cardService } from "@/services/cardService";
export { groupService } from "@/services/groupService";
export { participantService } from "@/services/participantService";
export { sessionService } from "@/services/sessionService";
export {
  getMockStore,
  resetMockStore,
  subscribeToStore,
  updateMockStore,
} from "@/services/store";
export { timerService } from "@/services/timerService";
export { voteService } from "@/services/voteService";
export { warmupService } from "@/services/warmupService";

import { actionBoardService } from "@/services/actionBoardService";
import { actionService } from "@/services/actionService";
import { cardService } from "@/services/cardService";
import { groupService } from "@/services/groupService";
import { participantService } from "@/services/participantService";
import { sessionService } from "@/services/sessionService";
import { timerService } from "@/services/timerService";
import { voteService } from "@/services/voteService";
import { warmupService } from "@/services/warmupService";

export const services = {
  session: sessionService,
  participant: participantService,
  warmup: warmupService,
  card: cardService,
  group: groupService,
  timer: timerService,
  vote: voteService,
  action: actionService,
  actionBoard: actionBoardService,
} as const;
