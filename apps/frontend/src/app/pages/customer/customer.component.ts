import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';

import { ROUTE_PATHS } from '@/app.routes';
import { AuthService } from '@/services/auth.service';
import { CustomerVoucherService } from '@/services/customer-voucher.service';
import { PickupRequestService } from '@/services/pickup-request.service';
import { CustomerActivePickupCardComponent } from './_components/customer-active-pickup-card.component';
import { CustomerQuickActionsComponent } from './_components/customer-quick-actions.component';
import { CustomerRankPanelComponent } from './_components/customer-rank-panel.component';
import { CustomerRecentRequestsComponent } from './_components/customer-recent-requests.component';
import { CustomerStatCardComponent } from './_components/customer-stat-card.component';
import { CustomerVoucherPanelComponent } from './_components/customer-voucher-panel.component';
import type {
  CustomerDashboardStat,
  CustomerLeaderboardRow,
  CustomerPickupSummary,
  CustomerQuickAction,
  CustomerVoucherSummary,
} from './_components/customer-dashboard.models';
import {
  ImageType,
  type LeaderboardEntry,
  PickupStatus,
  VoucherRedemptionStatus,
  VoucherStatus,
  type CustomerVoucherRedemption,
  type PickupRequestWithDetails,
  type RewardSummary,
} from '@wastegrab/shared';
import { AppHeaderComponent } from '@/ui/header/header.component';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FetchStateComponent,
    CustomerActivePickupCardComponent,
    CustomerQuickActionsComponent,
    CustomerRankPanelComponent,
    CustomerRecentRequestsComponent,
    CustomerStatCardComponent,
    CustomerVoucherPanelComponent,
    AppHeaderComponent,
  ],
})
export class CustomerPage {
  protected readonly authService = inject(AuthService);
  private readonly pickupRequests = inject(PickupRequestService);
  private readonly voucherService = inject(CustomerVoucherService);

  readonly newPickupPath = [
    '/',
    ROUTE_PATHS.customer.base,
    ROUTE_PATHS.customer.newPickup,
  ];
  readonly pickupsPath = [
    '/',
    ROUTE_PATHS.customer.base,
    ROUTE_PATHS.customer.pickups,
  ];
  readonly vouchersPath = [
    '/',
    ROUTE_PATHS.customer.base,
    ROUTE_PATHS.customer.vouchers,
  ];
  readonly leaderboardPath = [
    '/',
    ROUTE_PATHS.customer.base,
    ROUTE_PATHS.customer.leaderboard,
  ];

  protected readonly requests = signal<PickupRequestWithDetails[]>([]);
  protected readonly rewardSummary = signal<RewardSummary | null>(null);
  protected readonly voucherRedemptions = signal<CustomerVoucherRedemption[]>(
    [],
  );
  protected readonly leaderboard = signal<LeaderboardEntry[]>([]);
  protected readonly currentUserRank = signal<LeaderboardEntry | null>(null);
  protected readonly isLoadingRequests = signal(true);
  protected readonly loadErrorRequests = signal('');

  protected readonly activeRequest = computed(
    () =>
      this.requests().find((request) => this.isActiveStatus(request.status)) ??
      null,
  );
  protected readonly activeRequests = computed(() =>
    this.requests().filter((request) => this.isActiveStatus(request.status)),
  );
  protected readonly recentRequests = computed(() =>
    this.requests().slice(0, 4),
  );
  protected readonly activeVouchers = computed(() =>
    this.voucherRedemptions().filter((redemption) =>
      this.isActiveVoucher(redemption),
    ),
  );
  protected readonly customerName = computed(
    () => this.authService.currentUser()?.name?.trim() || 'Customer',
  );
  protected readonly activePickupSummary =
    computed<CustomerPickupSummary | null>(() => {
      const request = this.activeRequest();
      return request ? this.toPickupSummary(request) : null;
    });
  protected readonly recentPickupSummaries = computed<CustomerPickupSummary[]>(
    () => this.recentRequests().map((request) => this.toPickupSummary(request)),
  );
  protected readonly activeVoucherSummaries = computed<
    CustomerVoucherSummary[]
  >(() =>
    this.activeVouchers()
      .slice(0, 2)
      .map((redemption) => ({
        title: redemption.voucher.title,
        detail: `${redemption.redeemedCode || 'No code'} · ${this.voucherExpiryLabel(redemption)}`,
        pointsSpent: redemption.pointsSpent,
        route: this.vouchersPath,
      })),
  );
  protected readonly leaderboardRows = computed<CustomerLeaderboardRow[]>(
    () => {
      const entries = this.leaderboard().slice(0, 5);
      const currentRank = this.currentUserRank();

      if (
        currentRank &&
        !entries.some((entry) => entry.userId === currentRank.userId)
      ) {
        entries.push(currentRank);
      }

      return entries.map((entry) => ({
        rank: entry.rank,
        name: entry.name,
        value: `${Number(entry.totalWeightKg).toFixed(1)} kg`,
        isCurrentUser: entry.isCurrentUser,
        route: this.leaderboardPath,
      }));
    },
  );
  protected readonly quickActions = computed<CustomerQuickAction[]>(() => [
    {
      label: 'Request pickup',
      description: 'Submit sorted recyclables for collection.',
      route: this.newPickupPath,
      icon: 'lucidePlus',
      primary: true,
    },
    {
      label: 'Track requests',
      description: `${this.activeRequests().length} active request${this.activeRequests().length === 1 ? '' : 's'}.`,
      route: this.pickupsPath,
      icon: 'lucideTruck',
    },
    {
      label: 'Use rewards',
      description: `${this.rewardSummary()?.pointsBalance ?? 0} points ready to spend.`,
      route: this.vouchersPath,
      icon: 'lucideTicket',
    },
    {
      label: 'View ranks',
      description: 'See top contributors by verified weight.',
      route: this.leaderboardPath,
      icon: 'lucideTrophy',
    },
  ]);

  protected readonly dashboardStats = computed<CustomerDashboardStat[]>(() => [
    {
      label: 'Total requests',
      value: String(this.requests().length),
      icon: 'lucidePackage',
      tone: 'brand',
    },
    {
      label: 'Active',
      value: String(this.activeRequests().length),
      icon: 'lucideActivity',
      tone: 'info',
    },
    {
      label: 'Contributed',
      value: Number(this.rewardSummary()?.completedWeightKg ?? 0).toFixed(1),
      unit: 'kg',
      icon: 'lucideScale',
      tone: 'success',
    },
    {
      label: 'Points',
      value: `${this.rewardSummary()?.pointsBalance ?? 0}`,
      icon: 'lucideCoins',
      tone: 'warning',
    },
  ]);

  constructor() {
    void this.loadPickupRequests();
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected categoryLabel(request: PickupRequestWithDetails): string {
    return (
      request.aiClassificationLabel ||
      `${request.items.length} waste item${request.items.length === 1 ? '' : 's'}`
    );
  }

  protected requestWeight(request: PickupRequestWithDetails): number {
    return request.items.reduce(
      (total, item) =>
        total + Number(item.actualWeight ?? item.estimatedWeight ?? 0),
      0,
    );
  }

  protected potentialPoints(request: PickupRequestWithDetails): number {
    return request.items.reduce((total, item) => {
      const weight = Number(item.actualWeight ?? item.estimatedWeight ?? 0);
      return total + Math.round(weight * (item.category?.pointsPerKg ?? 0));
    }, 0);
  }

  protected primaryImage(request: PickupRequestWithDetails): string | null {
    return (
      request.images.find((image) => image.imageType === ImageType.USER_UPLOAD)
        ?.imageUrl ?? null
    );
  }

  protected voucherExpiryLabel(redemption: CustomerVoucherRedemption): string {
    return redemption.voucher.expiresAt
      ? `Expires ${new Date(redemption.voucher.expiresAt).toLocaleDateString()}`
      : 'No expiry';
  }

  protected statusLabel(status: PickupStatus): string {
    return status.toLowerCase().replace(/_/g, ' ');
  }

  protected statusClass(status: PickupStatus): string {
    switch (status) {
      case PickupStatus.PENDING:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case PickupStatus.ACCEPTED:
      case PickupStatus.ARRIVED:
      case PickupStatus.VERIFIED:
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
      case PickupStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  protected dateLabel(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  private toPickupSummary(
    request: PickupRequestWithDetails,
  ): CustomerPickupSummary {
    return {
      id: request.id,
      shortId: this.shortId(request.id),
      title: this.categoryLabel(request),
      address: request.addressText,
      status: request.status,
      statusLabel: this.statusLabel(request.status),
      statusClass: this.statusClass(request.status),
      imageUrl: this.primaryImage(request),
      weightKg: this.requestWeight(request),
      points: this.potentialPoints(request),
      itemCount: request.items.length,
      createdAtLabel: this.dateLabel(request.createdAt),
      detailRoute: [...this.pickupsPath, request.id],
      statusMessage: this.statusMessage(request.status),
    };
  }

  private statusMessage(status: PickupStatus): string {
    switch (status) {
      case PickupStatus.PENDING:
        return 'Waiting for a collector to accept';
      case PickupStatus.ACCEPTED:
        return 'Collector accepted your pickup';
      case PickupStatus.ARRIVED:
        return 'Collector has arrived';
      case PickupStatus.VERIFIED:
        return 'Waste weight has been verified';
      case PickupStatus.COMPLETED:
        return 'Pickup completed';
      case PickupStatus.CANCELLED:
        return 'Pickup cancelled';
      default:
        return 'Pickup request updated';
    }
  }

  private async loadPickupRequests(): Promise<void> {
    this.isLoadingRequests.set(true);
    this.loadErrorRequests.set('');
    try {
      const [pickupResponse, rewardResponse] = await Promise.all([
        firstValueFrom(this.pickupRequests.listPickupRequests()),
        firstValueFrom(this.pickupRequests.getRewardSummary()),
      ]);

      this.requests.set(pickupResponse.pickupRequests);
      this.rewardSummary.set(rewardResponse.summary);

      const [redemptionResponse, leaderboardResponse] = await Promise.all([
        firstValueFrom(this.voucherService.listRedemptions()).catch((err) => {
          console.warn('Failed to load customer voucher redemptions:', err);
          return null;
        }),
        firstValueFrom(this.pickupRequests.getLeaderboard()).catch((err) => {
          console.warn('Failed to load customer leaderboard:', err);
          return null;
        }),
      ]);

      this.voucherRedemptions.set(redemptionResponse?.redemptions ?? []);
      this.leaderboard.set(leaderboardResponse?.leaderboard ?? []);
      this.currentUserRank.set(leaderboardResponse?.currentUser ?? null);
    } catch (err) {
      console.error('Failed to load pickup requests:', err);
      this.loadErrorRequests.set('Unable to load dashboard data.');
    } finally {
      this.isLoadingRequests.set(false);
    }
  }

  private isActiveStatus(status: PickupStatus): boolean {
    return (
      status !== PickupStatus.COMPLETED && status !== PickupStatus.CANCELLED
    );
  }

  private isActiveVoucher(redemption: CustomerVoucherRedemption): boolean {
    if (redemption.status !== VoucherRedemptionStatus.REDEEMED) return false;
    if (redemption.voucher.status !== VoucherStatus.ACTIVE) return false;
    return (
      !redemption.voucher.expiresAt ||
      new Date(redemption.voucher.expiresAt).getTime() > Date.now()
    );
  }
}
