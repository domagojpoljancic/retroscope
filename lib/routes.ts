export function joinSessionRoute(sessionCode: string) {
  return `/join/${sessionCode}`;
}

export function sessionRoute(sessionId: string) {
  return `/session/${sessionId}`;
}

export function sessionSummaryRoute(sessionId: string) {
  return `/session/${sessionId}/summary`;
}

export function sharedActionsRoute(shareToken: string) {
  return `/actions/share/${shareToken}`;
}
