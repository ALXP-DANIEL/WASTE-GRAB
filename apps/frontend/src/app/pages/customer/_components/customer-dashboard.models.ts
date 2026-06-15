import type { PickupStatus } from '@wastegrab/shared';

export type CustomerQuickAction = {
  label: string;
  description: string;
  route: readonly string[];
  icon: string;
  primary?: boolean;
};

export type CustomerPickupSummary = {
  id: string;
  shortId: string;
  title: string;
  address: string;
  status: PickupStatus;
  statusLabel: string;
  statusClass: string;
  imageUrl: string | null;
  weightKg: number;
  points: number;
  itemCount: number;
  createdAtLabel: string;
  createdAtFullLabel: string;
  detailRoute: readonly string[];
  statusMessage: string;
};

export type CustomerVoucherSummary = {
  title: string;
  code: string;
  expiryLabel: string;
  pointsSpent: number;
  route: readonly string[];
};

export type CustomerLeaderboardRow = {
  rank: number;
  name: string;
  avatarUrl: string | null;
  value: string;
  isCurrentUser: boolean;
  route: readonly string[];
};
