import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavbarComponent } from '@/components/navbar/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [AppNavbarComponent, RouterOutlet],
  template: `
    <div class="min-h-dvh flex flex-col lg:grid lg:grid-cols-[14rem_1fr] bg-slate-50 text-slate-900">
      <app-navbar />
      <main class="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0 bg-stone-100 m-2 rounded-2xl border-dashed border-2 border-slate-300">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {}
