import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideShield, lucideTrash2, lucideTruck, lucideUsers } from '@ng-icons/lucide';

import { AppHeaderComponent } from '@/ui/header/header.component';
import { ZardTableImports } from '@/ui/zard/table';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardBadgeComponent } from '@/ui/zard/badge';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/ui/zard/form/form.component';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardSelectImports } from '@/ui/zard/select/select.imports';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { StatCardComponent } from '@/ui/stat-card/stat-card.component';
import { TableHeaderComponent } from '@/ui/table-header/table-header.component';
import { UserService } from '@/services/user.service';
import { DisplayRolePipe, RoleBadgeTypePipe } from '@/utils/role.pipe';
import type { User } from '@wastegrab/shared';
import { UserRole } from '@wastegrab/shared';

type UserModalMode = 'add' | 'edit' | null;
type UserFilter = 'all' | 'admin' | 'collector' | 'customer';

@Component({
  selector: 'app-admin-users-page',
  templateUrl: './users.html',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    AppHeaderComponent,
    ...ZardTableImports,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardModalComponent,
    FetchStateComponent,
    StatCardComponent,
    TableHeaderComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    ...ZardSelectImports,
    DisplayRolePipe,
    RoleBadgeTypePipe,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      lucidePencil,
      lucidePlus,
      lucideShield,
      lucideTrash2,
      lucideTruck,
      lucideUsers,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly activeFilter = signal<UserFilter>('all');
  protected readonly userModalMode = signal<UserModalMode>(null);
  protected readonly editingUserId = signal<string | null>(null);
  protected readonly filters: Array<{ value: UserFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'admin', label: 'Admins' },
    { value: 'collector', label: 'Collectors' },
    { value: 'customer', label: 'Customers' },
  ];
  protected readonly adminCount = computed(() => this.users().filter((user) => user.role === UserRole.ADMIN).length);
  protected readonly collectorCount = computed(() => this.users().filter((user) => user.role === UserRole.COLLECTOR).length);
  protected readonly customerCount = computed(() => this.users().filter((user) => user.role === UserRole.CUSTOMER).length);
  protected readonly filteredUsers = computed(() => {
    const users = this.users();
    const filter = this.activeFilter();

    if (filter === 'admin') return users.filter((user) => user.role === UserRole.ADMIN);
    if (filter === 'collector') return users.filter((user) => user.role === UserRole.COLLECTOR);
    if (filter === 'customer') return users.filter((user) => user.role === UserRole.CUSTOMER);
    return users;
  });

  protected readonly userForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
    phone: new FormControl('', {
      nonNullable: true,
    }),
    role: new FormControl(UserRole.CUSTOMER, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly userRoles = [UserRole.ADMIN, UserRole.COLLECTOR, UserRole.CUSTOMER];

  ngOnInit(): void {
    this.loadUsers();
  }

  protected setFilter(filter: UserFilter): void {
    this.activeFilter.set(filter);
  }

  protected refresh(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.userService.listUsers().subscribe({
      next: (list) => this.users.set(list),
      error: () => {
        this.users.set([]);
        this.loadError.set('Unable to load users.');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  protected openAddUser(): void {
    this.editingUserId.set(null);
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: UserRole.CUSTOMER,
    });
    this.userModalMode.set('add');
  }

  protected openEditUser(user: User): void {
    this.editingUserId.set(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      role: user.role,
    });
    // Disable email field for editing
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userModalMode.set('edit');
  }

  protected closeUserModal(): void {
    this.userModalMode.set(null);
    this.editingUserId.set(null);
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: UserRole.CUSTOMER,
    });
    // Re-enable email field
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  protected saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const currentId = this.editingUserId();
    const values = this.userForm.getRawValue();

    if (currentId === null) {
      this.userService.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
      }).subscribe({
        next: (created) => {
          this.users.update((list) => [created, ...list]);
          this.closeUserModal();
        },
      });
      return;
    }

    this.userService.updateUser(currentId, {
      name: values.name,
      phone: values.phone || undefined,
      role: values.role,
    }).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.closeUserModal();
      },
    });
  }

  protected deleteUser(user: User): void {
    this.dialogService.create({
      zTitle: 'Delete User',
      zDescription: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users.update((list) => list.filter((u) => u.id !== user.id));
          },
        });
      },
    });
  }
}
