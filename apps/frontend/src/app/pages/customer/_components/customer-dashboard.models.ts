import type { PickupStatus } from '@wastegrab/shared';

export type CustomerDashboardStat = {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  tone: 'brand' | 'info' | 'success' | 'warning' | 'neutral';
};

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
  detailRoute: readonly string[];
  statusMessage: string;
};

export type CustomerVoucherSummary = {
  title: string;
  detail: string;
  pointsSpent: number;
  route: readonly string[];
};

export type CustomerLeaderboardRow = {
  rank: number;
  name: string;
  value: string;
  isCurrentUser: boolean;
  route: readonly string[];
};
