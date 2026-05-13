import { AppHeaderComponent } from '@/components/header/header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-requests-page',
  imports: [AppHeaderComponent],
  templateUrl: './my-requests.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRequestsPage {}
