import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/components/button/button.component';
import { ZardCardComponent } from '@/components/card/card.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ZardButtonComponent, ZardCardComponent],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
