import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { UserHeaderComponent } from '@/components/header/header.component';
import { ZardButtonComponent } from '@/components/button/button.component';

@Component({
  selector: 'app-settings-page',
  imports: [UserHeaderComponent, ZardButtonComponent],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected notifications = true;
  protected emailUpdates = false;
  protected darkMode = false;

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }
  }

  toggleNotifications(): void {
    this.notifications = !this.notifications;
  }

  toggleEmailUpdates(): void {
    this.emailUpdates = !this.emailUpdates;
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  saveSettings(): void {
    // TODO: Implement settings save logic
    console.log('Settings saved', {
      notifications: this.notifications,
      emailUpdates: this.emailUpdates,
      darkMode: this.darkMode,
    });
  }
}
