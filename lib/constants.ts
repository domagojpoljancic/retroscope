export const PRODUCT = {
  name: "Retroscope",
  tagline: "Look back. Move forward.",
  description:
    "An all-in-one online retrospective workspace for facilitators and teams.",
} as const;

import { DEMO_SESSION_ID, MOCK_IDS } from "@/mock/ids";

export { DEMO_SESSION_ID };

export const DEMO_SESSION_CODE = MOCK_IDS.sessionCode;
export const DEMO_SHARE_TOKEN = MOCK_IDS.shareToken;

export const DEV_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Retro", href: "/sessions/new" },
  { label: "Demo Session", href: `/session/${DEMO_SESSION_ID}` },
  { label: "Actions", href: "/actions" },
] as const;
