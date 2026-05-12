import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  showOnMobile: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <!-- Desktop Sidebar (lg:) - Dark Green -->
    <aside class="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-dvh lg:w-56 lg:bg-emerald-900 lg:border-r lg:border-emerald-800 z-40 overflow-y-auto">
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
              class="px-4 py-2 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors flex items-center gap-3"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Navigation Menu Footer -->
      </div>
    </aside>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/70 z-40">
      <div class="flex items-center justify-around p-2">
        @for (item of navItems; track item.route) {
          @if (item.showOnMobile) {
            <a 
              [routerLink]="item.route" 
              class="flex flex-col items-center justify-center gap-1 px-4 py-2 text-slate-600 hover:text-emerald-900 transition-colors text-center"
            >
              <span class="text-lg">{{ item.icon }}</span>
              <span class="text-xs font-medium">{{ item.label }}</span>
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
    { label: 'Dashboard', route: '/', icon: '🏠', showOnMobile: true },
    // { label: 'Request Pickup', route: '/request-pickup', icon: '📦', showOnMobile: false },
    { label: 'My Requests', route: '/my-requests', icon: '📋', showOnMobile: true },
    { label: 'Rewards', route: '/rewards', icon: '🎁', showOnMobile: true },
    // { label: 'AI Scanner', route: '/ai-scanner', icon: '🤖', showOnMobile: false },
    // { label: 'Impact', route: '/impact', icon: '🌱', showOnMobile: false },
    // { label: 'Profile', route: '/profile', icon: '👤', showOnMobile: true },
    // { label: 'Settings', route: '/settings', icon: '⚙️', showOnMobile: false },
  ];
}