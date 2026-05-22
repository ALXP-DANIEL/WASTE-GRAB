import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppHeaderComponent } from '@/ui/header/header.component';
import { ZardTableImports } from '@/ui/zard/table';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/ui/zard/form/form.component';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { LocationService, type LocationRecord } from '@/services/location.service';
import { GooglePlaceInputComponent, type GooglePlaceSelection } from '@/ui/google-place-input/google-place-input.component';

type LocationModalMode = 'add' | 'edit' | null;

@Component({
  selector: 'app-admin-collectors-page',
  templateUrl: './collectors.html',
  imports: [
    ReactiveFormsModule,
    AppHeaderComponent,
    ...ZardTableImports,
    ZardButtonComponent,
    ZardModalComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    GooglePlaceInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCollectorsPage implements OnInit {
  private readonly locationService = inject(LocationService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly locations = signal<LocationRecord[]>([]);
  protected readonly modalMode = signal<LocationModalMode>(null);
  protected readonly editingLocationId = signal<string | null>(null);

  protected readonly createForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    address: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    state: new FormControl('', { nonNullable: true }),
    postalCode: new FormControl('', { nonNullable: true }),
    googlePlaceId: new FormControl('', { nonNullable: true }),
    latitude: new FormControl<number | null>(null),
    longitude: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    this.disableGoogleLocationFields();
    this.loadLocations();
  }

  private loadLocations(): void {
    this.locationService.listLocations().subscribe({ next: (list) => this.locations.set(list), error: () => this.locations.set([]) });
  }

  protected openAdd(): void {
    this.editingLocationId.set(null);
    this.createForm.reset({ name: '', address: '', city: '', state: '', postalCode: '', googlePlaceId: '', latitude: null, longitude: null });
    this.modalMode.set('add');
    this.disableGoogleLocationFields();
  }

  protected openEdit(location: LocationRecord): void {
    this.editingLocationId.set(location.id);
    this.createForm.reset({
      name: location.name,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      postalCode: location.postalCode || '',
      googlePlaceId: location.googlePlaceId || '',
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
    });
    this.modalMode.set('edit');
    this.disableGoogleLocationFields();
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.editingLocationId.set(null);
    this.disableGoogleLocationFields();
  }

  private disableGoogleLocationFields(): void {
    this.createForm.controls.address.disable({ emitEvent: false });
    this.createForm.controls.city.disable({ emitEvent: false });
    this.createForm.controls.state.disable({ emitEvent: false });
    this.createForm.controls.postalCode.disable({ emitEvent: false });
  }

  protected applyLocationPlace(place: GooglePlaceSelection): void {
    this.createForm.patchValue({
      name: place.name || this.createForm.controls.name.value,
      address: place.formattedAddress || place.addressLine,
      city: place.city,
      state: place.state,
      postalCode: place.postalCode,
      googlePlaceId: place.placeId,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  }

  protected saveCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const v = this.createForm.getRawValue();
    this.locationService.createLocation({
      name: v.name,
      address: v.address || undefined,
      city: v.city || undefined,
      state: v.state || undefined,
      postalCode: v.postalCode || undefined,
      googlePlaceId: v.googlePlaceId || undefined,
      latitude: v.latitude,
      longitude: v.longitude,
    }).subscribe({
      next: (created) => {
        this.locations.update((list) => [created, ...list]);
        this.closeModal();
      },
    });
  }

  protected saveEdit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const id = this.editingLocationId();
    if (!id) return;

    const v = this.createForm.getRawValue();
    this.locationService.updateLocation(id, {
      name: v.name,
      address: v.address || undefined,
      city: v.city || undefined,
      state: v.state || undefined,
      postalCode: v.postalCode || undefined,
      googlePlaceId: v.googlePlaceId || undefined,
      latitude: v.latitude,
      longitude: v.longitude,
    }).subscribe({
      next: (updated) => {
        this.locations.update((list) => list.map(l => (l.id === updated.id ? updated : l)));
        this.closeModal();
      }
    });
  }

  protected deleteLocation(location: LocationRecord): void {
    this.dialogService.create({
      zTitle: 'Delete Location',
      zDescription: `Are you sure you want to delete ${location.name}?`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        this.locationService.deleteLocation(location.id).subscribe({ next: () => this.loadLocations() });
      },
    });
  }

}
