import { AppHeaderComponent } from '@/components/header/header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-customer-new-pickup-page',
  templateUrl: './new-pickup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppHeaderComponent
  ],
})
export class CustomerNewPickupPage {}
