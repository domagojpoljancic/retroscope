export const MOCK_IDS = {
  workspace: "ws-product-platform",
  shareToken: "ppt-actions-share",
  users: {
    alex: "user-alex-morgan",
    marta: "user-marta-novak",
    jamie: "user-jamie-lee",
    priya: "user-priya-shah",
    tom: "user-tom-becker",
    sara: "user-sara-kim",
  },
  session: "session-sprint-24",
  sessionCode: "SPRT24",
  participants: {
    alex: "participant-alex",
    marta: "participant-marta",
    jamie: "participant-jamie",
    priya: "participant-priya",
    tom: "participant-tom",
    sara: "participant-sara",
  },
  groups: {
    planningClarity: "group-planning-clarity",
    releaseReadiness: "group-release-readiness",
  },
  timers: {
    writing: "timer-writing-sprint-24",
    voting: "timer-voting-sprint-24",
  },
  actionBoardShare: "abs-product-platform",
} as const;

export const DEMO_SESSION_ID = MOCK_IDS.session;
