import { ChangeDetectionStrategy, Component, OnInit, inject, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth.service';
import { ZardDialogService } from '@/components/dialog/dialog.service';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';
import { AppHeaderComponent } from '@/components/header/header.component';
import { ProfileModalComponent } from './profile-modal.component';

@Component({
  selector: 'app-profile-page',
  imports: [ 
    ZardAvatarComponent, 
    ZardButtonComponent, 
    DatePipe, 
    AppHeaderComponent, 
    ProfileModalComponent,
  ],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly router = inject(Router);

  private readonly profileModal = viewChild(ProfileModalComponent);

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }
  }

  protected editProfile(): void {
    this.profileModal()?.openEditProfile();
  }

  protected changePassword(): void {
    this.profileModal()?.openChangePassword();
  }

  protected logout(): void {
    this.dialogService.create({
      zTitle: 'Confirm Logout',
      zDescription: 'Are you sure you want to logout?',
      zOkText: 'Logout',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        this.authService.logout().subscribe({
          next: () => (window.location.href = '/auth'),
          error: () => (window.location.href = '/auth'),
        });
      },
    });
  }
}
