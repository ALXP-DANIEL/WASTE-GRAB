import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardFormFieldComponent, ZardFormLabelComponent, ZardFormControlComponent } from '@/ui/zard/form/form.component';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@/services/auth.service';
import type { ChangePasswordInput, UpdateProfileInput } from '@wastegrab/shared';

type ModalMode = 'edit-profile' | 'change-password' | null;

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardModalComponent,
  ],
  template: `
    <!-- Edit Profile Modal -->
    <z-modal
      [isOpen]="modalMode() === 'edit-profile'"
      title="Edit Profile"
      description="Update your profile information"
      okText="Save Changes"
      [okDestructive]="false"
      cancelText="Cancel"
      [isSubmitting]="isSubmitting()"
      [error]="error()"
      size="md"
      (ok)="submitEditProfile()"
      (dismissed)="close()"
    >
      <form [formGroup]="editProfileForm" class="space-y-4">
        <z-form-field>
          <z-form-label [zRequired]="true">Full Name</z-form-label>
          <z-form-control>
            <input
              z-input
              type="text"
              formControlName="name"
              placeholder="John Doe"
              class="w-full"
            />
          </z-form-control>
        </z-form-field>

        <z-form-field>
          <z-form-label>Phone (optional)</z-form-label>
          <z-form-control>
            <input
              z-input
              type="tel"
              formControlName="phone"
              placeholder="+1 (555) 000-0000"
              class="w-full"
              autocomplete="tel"
            />
          </z-form-control>
        </z-form-field>
      </form>
    </z-modal>

    <!-- Change Password Modal -->
    <z-modal
      [isOpen]="modalMode() === 'change-password'"
      title="Change Password"
      description="Enter your current and new password"
      okText="Change Password"
      [okDestructive]="false"
      cancelText="Cancel"
      [isSubmitting]="isSubmitting()"
      [error]="error()"
      size="md"
      (ok)="submitChangePassword()"
      (dismissed)="close()"
    >
      <form [formGroup]="changePasswordForm" class="space-y-4">
        <z-form-field>
          <z-form-label [zRequired]="true">Current Password</z-form-label>
          <z-form-control>
            <input
              z-input
              type="password"
              formControlName="currentPassword"
              placeholder="Enter your current password"
              class="w-full"
              autocomplete="current-password"
            />
          </z-form-control>
        </z-form-field>

        <z-form-field>
          <z-form-label [zRequired]="true">New Password</z-form-label>
          <z-form-control>
            <input
              z-input
              type="password"
              formControlName="newPassword"
              placeholder="At least 8 characters"
              class="w-full"
              autocomplete="new-password"
            />
          </z-form-control>
        </z-form-field>

        <z-form-field>
          <z-form-label [zRequired]="true">Confirm Password</z-form-label>
          <z-form-control>
            <input
              z-input
              type="password"
              formControlName="confirmPassword"
              placeholder="Repeat your password"
              class="w-full"
              autocomplete="new-password"
            />
          </z-form-control>
        </z-form-field>
      </form>
    </z-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileModalComponent {
  protected readonly authService = inject(AuthService);

  protected readonly modalMode = signal<ModalMode>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');

  readonly closeModal = output<void>();
  readonly successUpdate = output<void>();

  protected readonly editProfileForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
    }),
  });

  protected readonly changePasswordForm = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  openEditProfile(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    
    this.editProfileForm.patchValue({
      name: user.name,
      phone: user.phone || '',
    });
    this.error.set('');
    this.modalMode.set('edit-profile');
  }

  openChangePassword(): void {
    this.changePasswordForm.reset();
    this.error.set('');
    this.modalMode.set('change-password');
  }

  close(): void {
    this.modalMode.set(null);
    this.error.set('');
    this.editProfileForm.reset();
    this.changePasswordForm.reset();
    this.closeModal.emit();
  }

  submitEditProfile(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    const { name, phone } = this.editProfileForm.getRawValue();
    const input: UpdateProfileInput = { name, phone };
    this.authService.updateProfile(input).subscribe({
      next: (user) => {
        this.isSubmitting.set(false);
        this.authService.currentUser.set(user);
        this.successUpdate.emit();
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.error || 'Failed to update profile');
      },
    });
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.changePasswordForm.controls.newPassword.value;
    const confirmPassword = this.changePasswordForm.controls.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');

    const { currentPassword } = this.changePasswordForm.getRawValue();
    const input: ChangePasswordInput = {
      currentPassword,
      newPassword,
    };
    this.authService.changePassword(input).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.authService.currentUser.set(response.user);
        this.successUpdate.emit();
        this.close();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.error || 'Failed to change password');
      },
    });
  }
}
