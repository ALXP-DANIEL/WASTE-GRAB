import { AppHeaderComponent } from '@/ui/header/header.component';
import { ROUTE_PATHS, routePath } from '@/app.routes';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppHeaderComponent,
    RouterLink,
  ],
})
export class AdminPage {
  protected readonly notificationRoute = routePath(ROUTE_PATHS.admin.base, ROUTE_PATHS.admin.notifications);
}
