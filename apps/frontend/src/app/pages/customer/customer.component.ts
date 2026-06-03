import { AppHeaderComponent } from '@/ui/header/header.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import {
  lucideAlertTriangle,
  lucideArrowRight,
  lucideCalendarCheck,
  lucideChevronRight,
  lucideCheckCircle2,
  lucideClock3,
  lucideGift,
  lucideImage,
  lucideMapPin,
  lucidePackage,
  lucidePlus,
  lucideRecycle,
  lucideScale,
  lucideTicket,
  lucideTrophy,
  lucideTruck,
} from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ROUTE_PATHS } from '@/app.routes';
import { CustomerVoucherService } from '@/services/customer-voucher.service';
import { PickupRequestService } from '@/services/pickup-request.service';
import {
  ImageType,
  PickupStatus,
  VoucherRedemptionStatus,
  VoucherStatus,
  type CustomerVoucherRedemption,
  type PickupRequestWithDetails,
  type RewardSummary,
} from '@wastegrab/shared';

type DashboardStat = {
  label: string;
  value: string;
  icon: string;
  accentClass: string;
};

type QuickAction = {
  label: string;
  description: string;
  route: string[];
  icon: string;
};

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AppHeaderComponent, FetchStateComponent, ZardButtonComponent, NgIcon, RouterLink],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowRight,
      lucideCalendarCheck,
      lucideChevronRight,
      lucideCheckCircle2,
      lucideClock3,
      lucideGift,
      lucideImage,
      lucideMapPin,
      lucidePackage,
      lucidePlus,
      lucideRecycle,
      lucideScale,
      lucideTicket,
      lucideTrophy,
      lucideTruck,
    }),
  ],
})
export class CustomerPage {
  private readonly pickupRequests = inject(PickupRequestService);
  private readonly voucherService = inject(CustomerVoucherService);

  readonly routePaths = ROUTE_PATHS;
  readonly newPickupPath = ['/', ROUTE_PATHS.customer.base, ROUTE_PATHS.customer.newPickup];
  readonly pickupsPath = ['/', ROUTE_PATHS.customer.base, ROUTE_PATHS.customer.pickups];
  readonly vouchersPath = ['/', ROUTE_PATHS.customer.base, ROUTE_PATHS.customer.vouchers];
  readonly leaderboardPath = ['/', ROUTE_PATHS.customer.base, ROUTE_PATHS.customer.leaderboard];

  protected readonly requests = signal<PickupRequestWithDetails[]>([]);
  protected readonly rewardSummary = signal<RewardSummary | null>(null);
  protected readonly voucherRedemptions = signal<CustomerVoucherRedemption[]>([]);
  protected readonly isLoadingRequests = signal(true);
  protected readonly loadErrorRequests = signal('');

  protected readonly activeRequest = computed(
    () => this.requests().find((request) => this.isActiveStatus(request.status)) ?? null,
  );
  protected readonly activeRequests = computed(() => this.requests().filter((request) => this.isActiveStatus(request.status)));
  protected readonly completedRequests = computed(() => this.requests().filter((request) => request.status === PickupStatus.COMPLETED));
  protected readonly recentRequests = computed(() => this.requests().slice(0, 4));
  protected readonly activeVouchers = computed(() => (
    this.voucherRedemptions().filter((redemption) => this.isActiveVoucher(redemption))
  ));
  protected readonly latestActiveVoucher = computed(() => this.activeVouchers()[0] ?? null);
  protected readonly quickActions = computed<QuickAction[]>(() => [
    {
      label: 'Book pickup',
      description: 'Submit sorted recyclables for collection.',
      route: this.newPickupPath,
      icon: 'lucidePlus',
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

  protected readonly dashboardStats = computed<DashboardStat[]>(() => [
    {
      label: 'Total Requests',
      value: String(this.requests().length),
      icon: 'lucidePackage',
      accentClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Active Requests',
      value: String(this.activeRequests().length),
      icon: 'lucideTruck',
      accentClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Contributed Weight',
      value: `${Number(this.rewardSummary()?.completedWeightKg ?? 0).toFixed(1)} kg`,
      icon: 'lucideScale',
      accentClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Points Balance',
      value: String(this.rewardSummary()?.pointsBalance ?? 0),
      icon: 'lucideGift',
      accentClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
      label: 'Active Vouchers',
      value: String(this.activeVouchers().length),
      icon: 'lucideTicket',
      accentClass: 'bg-primary/10 text-primary',
    },
  ]);

  constructor() {
    void this.loadPickupRequests();
  }

  protected shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected categoryLabel(request: PickupRequestWithDetails): string {
    return request.aiClassificationLabel || `${request.items.length} waste item${request.items.length === 1 ? '' : 's'}`;
  }

  protected requestWeight(request: PickupRequestWithDetails): number {
    return request.items.reduce(
      (total, item) => total + Number(item.actualWeight ?? item.estimatedWeight ?? 0),
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
    return request.images.find((image) => image.imageType === ImageType.USER_UPLOAD)?.imageUrl ?? null;
  }

  protected voucherExpiryLabel(redemption: CustomerVoucherRedemption): string {
    return redemption.voucher.expiresAt ? `Expires ${new Date(redemption.voucher.expiresAt).toLocaleDateString()}` : 'No expiry';
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

  private async loadPickupRequests(): Promise<void> {
    this.isLoadingRequests.set(true);
    this.loadErrorRequests.set('');
    try {
      const [pickupResponse, rewardResponse, redemptionResponse] = await Promise.all([
        firstValueFrom(this.pickupRequests.listPickupRequests()),
        firstValueFrom(this.pickupRequests.getRewardSummary()),
        firstValueFrom(this.voucherService.listRedemptions()),
      ]);
      this.requests.set(pickupResponse.pickupRequests);
      this.rewardSummary.set(rewardResponse.summary);
      this.voucherRedemptions.set(redemptionResponse.redemptions);
    } catch (err) {
      console.error('Failed to load pickup requests:', err);
      this.loadErrorRequests.set('Unable to load dashboard data.');
    } finally {
      this.isLoadingRequests.set(false);
    }
  }

  private isActiveStatus(status: PickupStatus): boolean {
    return status !== PickupStatus.COMPLETED && status !== PickupStatus.CANCELLED;
  }

  private isActiveVoucher(redemption: CustomerVoucherRedemption): boolean {
    if (redemption.status !== VoucherRedemptionStatus.REDEEMED) return false;
    if (redemption.voucher.status !== VoucherStatus.ACTIVE) return false;
    return !redemption.voucher.expiresAt || new Date(redemption.voucher.expiresAt).getTime() > Date.now();
  }
}
