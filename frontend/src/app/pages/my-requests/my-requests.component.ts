import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-requests-page',
  imports: [],
  templateUrl: './my-requests.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRequestsPage {}
