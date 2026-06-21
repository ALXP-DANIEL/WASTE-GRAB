import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideImage, lucideMapPin, lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

import { AppHeaderComponent } from '@/ui/header/header.component';
import { ZardTableImports } from '@/ui/zard/table';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/ui/zard/form/form.component';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { StatCardComponent } from '@/ui/stat-card/stat-card.component';
import { TableHeaderComponent } from '@/ui/table-header/table-header.component';
import { LocationService, type LocationRecord } from '@/services/location.service';
import { GooglePlaceInputComponent, type GooglePlaceSelection } from '@/ui/google-place-input/google-place-input.component';

type LocationModalMode = 'add' | 'edit' | null;

@Component({
  selector: 'app-admin-collection-location-page',
  templateUrl: './collection-location.html',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppHeaderComponent,
    ...ZardTableImports,
    ZardButtonComponent,
    FetchStateComponent,
    StatCardComponent,
    TableHeaderComponent,
    ZardModalComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
    GooglePlaceInputComponent,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      lucideMapPin,
      lucideExternalLink,
      lucideImage,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCollectionLocationPage implements OnInit, OnDestroy {
  private readonly locationService = inject(LocationService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly locations = signal<LocationRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly modalMode = signal<LocationModalMode>(null);
  protected readonly editingLocationId = signal<string | null>(null);
  protected readonly imageCount = computed(() => this.locations().filter((location) => location.imageUrl).length);
  protected readonly cityCount = computed(() => new Set(this.locations()
    .map((location) => location.city)
    .filter(Boolean)).size);
  protected readonly placeImagePreview = signal<string | null>(null);
  private placeImageFile: File | null = null;
  private placeImageObjectUrl: string | null = null;
  private placeImageCleared = false;

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

  ngOnDestroy(): void {
    this.clearPlaceImageObjectUrl();
  }

  private loadLocations(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.locationService.listLocations().subscribe({
      next: (list) => this.locations.set(list),
      error: () => {
        this.locations.set([]);
        this.loadError.set('Unable to load locations.');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  protected openAdd(): void {
    this.editingLocationId.set(null);
    this.createForm.reset({ name: '', address: '', city: '', state: '', postalCode: '', googlePlaceId: '', latitude: null, longitude: null });
    this.resetPlaceImage(null);
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
    this.resetPlaceImage(location.imageUrl);
    this.modalMode.set('edit');
    this.disableGoogleLocationFields();
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.editingLocationId.set(null);
    this.resetPlaceImage(null);
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

    this.locationService.createLocation(this.buildLocationPayload()).subscribe({
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

    this.locationService.updateLocation(id, this.buildLocationPayload()).subscribe({
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

  protected locationSlug(location: LocationRecord): string {
    const slug = location.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'location';

    return `${slug}--${location.id}`;
  }

  protected onPlaceImageSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    if (!file) {
      return;
    }

    this.clearPlaceImageObjectUrl();
    this.placeImageFile = file;
    this.placeImageCleared = false;
    this.placeImageObjectUrl = URL.createObjectURL(file);
    this.placeImagePreview.set(this.placeImageObjectUrl);
  }

  protected clearPlaceImage(): void {
    this.resetPlaceImage(null);
  }

  private buildLocationPayload(): FormData | {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    googlePlaceId?: string;
    latitude: number | null;
    longitude: number | null;
    imageUrl?: string | null;
  } {
    const v = this.createForm.getRawValue();

    if (!this.placeImageFile) {
      return {
        name: v.name,
        address: v.address || undefined,
        city: v.city || undefined,
        state: v.state || undefined,
        postalCode: v.postalCode || undefined,
        googlePlaceId: v.googlePlaceId || undefined,
        latitude: v.latitude,
        longitude: v.longitude,
        ...(this.placeImageCleared ? { imageUrl: null } : {}),
      };
    }

    const payload = new FormData();
    payload.append('name', v.name);
    if (v.address) payload.append('address', v.address);
    if (v.city) payload.append('city', v.city);
    if (v.state) payload.append('state', v.state);
    if (v.postalCode) payload.append('postalCode', v.postalCode);
    if (v.googlePlaceId) payload.append('googlePlaceId', v.googlePlaceId);
    if (v.latitude !== null) payload.append('latitude', String(v.latitude));
    if (v.longitude !== null) payload.append('longitude', String(v.longitude));
    payload.append('image', this.placeImageFile);
    return payload;
  }

  private resetPlaceImage(previewUrl: string | null): void {
    this.clearPlaceImageObjectUrl();
    this.placeImageFile = null;
    this.placeImageCleared = previewUrl === null;
    this.placeImagePreview.set(previewUrl);
  }

  private clearPlaceImageObjectUrl(): void {
    if (this.placeImageObjectUrl) {
      URL.revokeObjectURL(this.placeImageObjectUrl);
      this.placeImageObjectUrl = null;
    }
  }

}
