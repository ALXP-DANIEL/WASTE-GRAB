import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ZardInputDirective } from '@/components/input';
import { GoogleMapsService } from '@/services/google-maps.service';

export interface GooglePlaceSelection {
  name: string;
  formattedAddress: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
}

@Component({
  selector: 'app-google-place-input',
  imports: [ZardInputDirective],
  template: `
    <input
      #placeInput
      z-input
      type="text"
      autocomplete="off"
      class="w-full"
      [disabled]="!maps.isConfigured"
      [placeholder]="maps.isConfigured ? placeholder() : 'Google Maps API key missing'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GooglePlaceInputComponent implements AfterViewInit, OnDestroy {
  protected readonly maps = inject(GoogleMapsService);
  private readonly zone = inject(NgZone);

  readonly placeholder = input('Search Google Maps');
  readonly country = input('my');
  readonly placeSelected = output<GooglePlaceSelection>();

  private readonly placeInput = viewChild.required<ElementRef<HTMLInputElement>>('placeInput');
  private autocomplete: any = null;
  private listener: any = null;
  protected readonly failed = signal(false);

  ngAfterViewInit(): void {
    void this.initAutocomplete();
  }

  ngOnDestroy(): void {
    if (this.listener?.remove) {
      this.listener.remove();
    }
  }

  private async initAutocomplete(): Promise<void> {
    try {
      await this.maps.loadPlaces();
      const googleMaps = (window as any).google?.maps;
      if (!googleMaps?.places) return;

      this.autocomplete = new googleMaps.places.Autocomplete(this.placeInput().nativeElement, {
        componentRestrictions: { country: this.country() },
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
      });

      this.listener = this.autocomplete.addListener('place_changed', () => {
        this.zone.run(() => this.handlePlaceChanged());
      });
    } catch {
      this.failed.set(true);
    }
  }

  private handlePlaceChanged(): void {
    const place = this.autocomplete?.getPlace();
    if (!place) return;

    const components = this.getComponents(place.address_components ?? []);
    const latitude = place.geometry?.location?.lat ? Number(place.geometry.location.lat()) : null;
    const longitude = place.geometry?.location?.lng ? Number(place.geometry.location.lng()) : null;
    const formattedAddress = String(place.formatted_address ?? '');
    const name = String(place.name ?? '');
    const addressLine = this.buildAddressLine(components, name, formattedAddress);

    this.placeSelected.emit({
      name,
      formattedAddress,
      addressLine,
      city: components.city,
      state: components.state,
      postalCode: components.postalCode,
      latitude,
      longitude,
      placeId: String(place.place_id ?? ''),
    });
  }

  private getComponents(addressComponents: any[]): {
    streetNumber: string;
    route: string;
    premise: string;
    city: string;
    state: string;
    postalCode: string;
  } {
    const result = {
      streetNumber: '',
      route: '',
      premise: '',
      city: '',
      state: '',
      postalCode: '',
    };

    for (const component of addressComponents) {
      const types = component.types as string[];
      if (types.includes('street_number')) result.streetNumber = component.long_name;
      if (types.includes('route')) result.route = component.long_name;
      if (types.includes('premise') || types.includes('establishment')) result.premise = component.long_name;
      if (types.includes('locality')) result.city = component.long_name;
      if (!result.city && types.includes('postal_town')) result.city = component.long_name;
      if (!result.city && types.includes('administrative_area_level_2')) result.city = component.long_name;
      if (!result.city && types.includes('sublocality_level_1')) result.city = component.long_name;
      if (types.includes('administrative_area_level_1')) result.state = component.long_name;
      if (types.includes('postal_code')) result.postalCode = component.long_name;
      if (types.includes('postal_code_suffix')) result.postalCode = `${result.postalCode}-${component.long_name}`;
    }

    return result;
  }

  private buildAddressLine(
    components: { streetNumber: string; route: string; premise: string },
    name: string,
    formattedAddress: string,
  ): string {
    const street = [components.streetNumber, components.route].filter(Boolean).join(' ');
    if (street) return street;
    if (components.premise) return components.premise;
    if (name) return name;
    return formattedAddress;
  }
}
