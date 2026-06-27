import { DEMO_SESSION_ID, MOCK_IDS } from "@/mock/ids";

export const PRODUCT = {
  name: "Retroscope",
  tagline: "Look back. Move forward.",
  description:
    "An all-in-one online retrospective workspace for facilitators and teams.",
} as const;

export { DEMO_SESSION_ID };

export const DEMO_SESSION_CODE = MOCK_IDS.sessionCode;
export const DEMO_SHARE_TOKEN = MOCK_IDS.shareToken;

/** Primary product navigation shown in the site header. */
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New retro", href: "/sessions/new" },
  { label: "Action board", href: "/actions" },
] as const;
