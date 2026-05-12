import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ZardAvatarComponent } from '@/components/avatar/avatar.component';
import { AuthService } from '@/services/auth.service';
import { UserHeaderComponent } from '@/components/header/header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [ UserHeaderComponent],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected randomQuote = '';

  private readonly quotes = [
    "Let's make our environment cleaner together.",
    'Every piece of waste recycled makes a difference.',
    'Together we can build a sustainable future.',
    "Reduce, reuse, recycle – that's the way.",
    'Your actions today shape tomorrow\'s world.',
    'Make waste management easy and rewarding.',
    'Join the movement towards zero waste.',
    'Small steps lead to big environmental changes.',
  ];

  ngOnInit(): void {
    if (!this.authService.hasLoadedSession()) {
      void this.authService.loadSession().subscribe();
    }

    this.randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }
}
