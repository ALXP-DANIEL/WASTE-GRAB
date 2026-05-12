import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavbarComponent } from '@/components/navbar/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [AppNavbarComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900">
      <app-navbar />
      <main class="min-h-0">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {}
