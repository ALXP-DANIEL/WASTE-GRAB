import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '@/services/auth.service';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';

@Component({
  selector: 'app-profile-page',
  imports: [ ZardAvatarComponent, ZardButtonComponent, DatePipe],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  protected readonly authService = inject(AuthService);

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }
  }
}
