import { AppHeaderComponent } from '@/ui/header/header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppHeaderComponent
  ]
})
export class AdminPage {}
