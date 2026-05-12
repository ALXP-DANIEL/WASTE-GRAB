import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { UserHeaderComponent } from '@/components/header/header.component';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { ZardButtonComponent } from '@/components/button/button.component';

@Component({
  selector: 'app-profile-page',
  imports: [UserHeaderComponent, ZardAvatarComponent, ZardButtonComponent],
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
