import { daysAgo } from "@/lib/dates";
import type { Profile } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

export const mockProfiles: Profile[] = [
  {
    id: MOCK_IDS.users.alex,
    displayName: "Alex Morgan",
    email: "alex.morgan@example.com",
    createdAt: daysAgo(180),
  },
  {
    id: MOCK_IDS.users.marta,
    displayName: "Marta Novak",
    email: "marta.novak@example.com",
    createdAt: daysAgo(120),
  },
  {
    id: MOCK_IDS.users.jamie,
    displayName: "Jamie Lee",
    email: "jamie.lee@example.com",
    createdAt: daysAgo(90),
  },
  {
    id: MOCK_IDS.users.priya,
    displayName: "Priya Shah",
    email: "priya.shah@example.com",
    createdAt: daysAgo(75),
  },
  {
    id: MOCK_IDS.users.tom,
    displayName: "Tom Becker",
    email: "tom.becker@example.com",
    createdAt: daysAgo(60),
  },
  {
    id: MOCK_IDS.users.sara,
    displayName: "Sara Kim",
    email: "sara.kim@example.com",
    createdAt: daysAgo(45),
  },
];

export const facilitatorProfile = mockProfiles[0];
