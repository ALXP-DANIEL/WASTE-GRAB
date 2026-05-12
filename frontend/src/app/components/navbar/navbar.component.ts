import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideRecycle, lucideGift } from '@ng-icons/lucide';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  showOnMobile: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [provideIcons({ lucideHome, lucideRecycle, lucideGift })],
  template: `
    <!-- Desktop Sidebar (lg:) - Dark Green -->
    <aside class="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-dvh lg:w-56 lg:bg-emerald-900 lg:border-r lg:border-emerald-800 z-40 lg:rounded-tr-2xl lg:rounded-br-2xl overflow-y-auto">
      <div class="flex flex-col h-full">
        <!-- Brand -->
        <div class="px-6 py-6 border-b border-emerald-800">
          <a
  routerLink="/"
  class="flex justify-center items-center text-center gap-3 text-white no-underline hover:opacity-80 transition-opacity"
>
  <span class="text-sm font-extrabold uppercase tracking-[0.18em] text-white">
    WasteGrab
  </span>
</a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 flex flex-col gap-2 px-4 py-6">
          @for (item of navItems; track item.route) {
            <a 
              [routerLink]="item.route" 
              routerLinkActive="bg-emerald-800 rounded-xl"
              [routerLinkActiveOptions]="{ exact: true }"
              class="group flex items-center gap-3 rounded-xl text-sm font-medium text-emerald-100 transition-colors"
            >
              <span class="flex w-full items-center gap-3 rounded-xl px-4 py-2 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                <ng-icon [name]="item.icon" class="size-4! shrink-0 text-emerald-100" />
                <span>{{ item.label }}</span>
              </span>
            </a>
          }
        </nav>

        <!-- Navigation Menu Footer -->
      </div>
    </aside>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden bg-emerald-900 border border-emerald-800 rounded-2xl z-40 shadow-lg mx-2 mb-2">
      <div class="flex items-center justify-around p-3">
        @for (item of navItems; track item.route) {
          @if (item.showOnMobile) {
            <a 
              [routerLink]="item.route" 
              routerLinkActive="bg-emerald-800 rounded-xl"
              [routerLinkActiveOptions]="{ exact: true }"
              class="group flex flex-col items-center justify-center gap-1 rounded-xl text-center text-emerald-100 transition-colors"
            >
              <span class="flex w-full flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                <ng-icon [name]="item.icon" class="size-5!" />
                <span class="text-xs font-medium">{{ item.label }}</span>
              </span>
            </a>
          }
        }
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavbarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'lucideHome', showOnMobile: true },
    { label: 'My Requests', route: '/my-requests', icon: 'lucideRecycle', showOnMobile: true },
    { label: 'Rewards', route: '/rewards', icon: 'lucideGift', showOnMobile: true },
  ];
}