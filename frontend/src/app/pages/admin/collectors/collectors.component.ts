import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppHeaderComponent } from '@/components/header/header.component';
import { ZardTableImports } from '@/components/table';
import { ZardButtonComponent } from '@/components/button/button.component';
import { ZardModalComponent } from '@/components/modal/modal.component';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/components/form/form.component';
import { ZardInputDirective } from '@/components/input';
import { ZardDialogService } from '@/components/dialog/dialog.service';
import { LocationService, type LocationRecord } from '@/services/location.service';

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
  });

  ngOnInit(): void {
    this.loadLocations();
  }

  private loadLocations(): void {
    this.locationService.listLocations().subscribe({ next: (list) => this.locations.set(list), error: () => this.locations.set([]) });
  }

  protected openAdd(): void {
    this.editingLocationId.set(null);
    this.createForm.reset({ name: '', address: '', city: '' });
    this.modalMode.set('add');
  }

  protected openEdit(location: LocationRecord): void {
    this.editingLocationId.set(location.id);
    this.createForm.reset({ name: location.name, address: location.address || '', city: location.city || '' });
    this.modalMode.set('edit');
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.editingLocationId.set(null);
  }

  protected saveCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const v = this.createForm.getRawValue();
    this.locationService.createLocation({ name: v.name, address: v.address || undefined, city: v.city || undefined }).subscribe({
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
    this.locationService.updateLocation(id, { name: v.name, address: v.address || undefined, city: v.city || undefined }).subscribe({
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
