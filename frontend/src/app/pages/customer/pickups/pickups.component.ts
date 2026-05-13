import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-customer-pickups-page',
  templateUrl: './pickups.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerPickupsPage {}
