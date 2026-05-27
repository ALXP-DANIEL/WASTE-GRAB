import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucidePin, lucidePlus, lucideRadio, lucideRefreshCw, lucideSend } from '@ng-icons/lucide';
import { NotificationTargetRole, type AdminNotificationLog } from '@wastegrab/shared';

import { ROUTE_PATHS, routePath } from '@/app.routes';
import { AdminNotificationService } from '@/services/admin-notification.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { ZardBadgeComponent } from '@/ui/zard/badge';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardCheckboxComponent } from '@/ui/zard/checkbox';
import { ZardDatePickerComponent } from '@/ui/zard/date-picker';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/ui/zard/form/form.component';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { ZardSelectImports } from '@/ui/zard/select/select.imports';
import { ZardTableImports } from '@/ui/zard/table';

type NotificationTab = 'announcements' | 'deliveries' | 'policy';
type NotificationModalMode = 'add' | null;

@Component({
  selector: 'app-admin-notifications-page',
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    AppHeaderComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCheckboxComponent,
    ZardDatePickerComponent,
    ZardModalComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    NgIcon,
    ...ZardSelectImports,
    ...ZardTableImports,
  ],
  viewProviders: [
    provideIcons({
      lucideBell,
      lucidePin,
      lucidePlus,
      lucideRadio,
      lucideRefreshCw,
      lucideSend,
    }),
  ],
})
export class AdminNotificationsPage implements OnInit {
  private readonly notificationService = inject(AdminNotificationService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly NotificationTargetRole = NotificationTargetRole;
  protected readonly audienceOptions = [
    { value: NotificationTargetRole.ALL, label: 'Everyone' },
    { value: NotificationTargetRole.CUSTOMER, label: 'Customers' },
    { value: NotificationTargetRole.COLLECTOR, label: 'Collectors' },
    { value: NotificationTargetRole.ADMIN, label: 'Admins' },
  ];
  protected readonly dashboardRoute = routePath(ROUTE_PATHS.admin.base);
  protected readonly logs = signal<AdminNotificationLog[]>([]);
  protected readonly isSending = signal(false);
  protected readonly activeTab = signal<NotificationTab>('announcements');
  protected readonly modalMode = signal<NotificationModalMode>(null);
  protected readonly totalSent = computed(() => this.logs().reduce((sum, log) => sum + log.sentCount, 0));
  protected readonly pinnedCount = computed(() => this.logs().filter((log) => !log.isClearable).length);
  protected readonly expiringCount = computed(() => this.logs().filter((log) => Boolean(log.expiresAt)).length);
  protected readonly clearableCount = computed(() => this.logs().filter((log) => log.isClearable).length);

  protected readonly announcementForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    targetRole: new FormControl<NotificationTargetRole>(NotificationTargetRole.ALL, { nonNullable: true }),
    actionUrl: new FormControl('', { nonNullable: true }),
    isClearable: new FormControl(true, { nonNullable: true }),
    expiresAt: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  protected selectTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  protected openAdd(): void {
    this.announcementForm.reset({
      title: '',
      message: '',
      targetRole: NotificationTargetRole.ALL,
      actionUrl: '',
      isClearable: true,
      expiresAt: null,
    });
    this.modalMode.set('add');
  }

  protected closeModal(): void {
    this.modalMode.set(null);
  }

  protected sendAnnouncement(): void {
    if (this.announcementForm.invalid || this.isSending()) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    const value = this.announcementForm.getRawValue();
    this.isSending.set(true);
    this.notificationService.sendNotification({
      title: value.title,
      message: value.message,
      targetRole: value.targetRole,
      actionUrl: value.actionUrl || null,
      isClearable: value.isClearable,
      expiresAt: toEndOfDayIso(value.expiresAt),
    }).subscribe({
      next: (response) => {
        this.dialogService.create({
          zTitle: 'Announcement sent',
          zDescription: `Sent to ${response.sentCount} user${response.sentCount === 1 ? '' : 's'}.`,
          zOkText: 'Done',
          zWidth: 'max-w-sm',
        });
        this.announcementForm.reset({
          title: '',
          message: '',
          targetRole: NotificationTargetRole.ALL,
          actionUrl: '',
          isClearable: true,
          expiresAt: null,
        });
        this.closeModal();
        this.loadLogs();
      },
      error: (err) => {
        this.dialogService.create({
          zTitle: 'Send failed',
          zDescription: getErrorMessage(err) || 'Unable to send announcement.',
          zOkText: 'OK',
          zWidth: 'max-w-sm',
        });
      },
      complete: () => this.isSending.set(false),
    });
  }

  protected refreshLogs(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.notificationService.listLogs().subscribe({
      next: (response) => this.logs.set(response.logs),
      error: () => this.logs.set([]),
    });
  }
}

function toEndOfDayIso(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  const expiry = new Date(date);
  expiry.setHours(23, 59, 59, 999);

  return expiry.toISOString();
}

function getErrorMessage(err: unknown): string | null {
  if (typeof err !== 'object' || err === null || !('error' in err)) {
    return null;
  }

  const response = (err as { error?: unknown }).error;
  if (typeof response === 'object' && response !== null && 'error' in response) {
    const message = (response as { error?: unknown }).error;
    return typeof message === 'string' ? message : null;
  }

  return null;
}
