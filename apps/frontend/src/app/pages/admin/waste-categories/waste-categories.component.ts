import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppHeaderComponent } from '@/ui/header/header.component';
import { ZardTableImports } from '@/ui/zard/table';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';
import { ZardCheckboxComponent } from '@/ui/zard/checkbox';
import { ZardModalComponent } from '@/ui/zard/modal/modal.component';
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from '@/ui/zard/form/form.component';
import { ZardInputDirective } from '@/ui/zard/input';
import { ZardDialogService } from '@/ui/zard/dialog/dialog.service';
import { WasteCategoryService } from '@/services/waste-category.service';
import type { WasteCategory } from '@wastegrab/shared';

type WasteCategoryModalMode = 'add' | 'edit' | null;

@Component({
  selector: 'app-admin-waste-categories-page',
  templateUrl: './waste-categories.html',
  imports: [
    ReactiveFormsModule,
    AppHeaderComponent,
    ...ZardTableImports,
    ZardButtonComponent,
    ZardCheckboxComponent,
    ZardModalComponent,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardInputDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWasteCategoriesPage implements OnInit {
  private readonly wasteCategoryService = inject(WasteCategoryService);
  private readonly dialogService = inject(ZardDialogService);

  protected readonly categories = signal<WasteCategory[]>([]);
  protected readonly modalMode = signal<WasteCategoryModalMode>(null);
  protected readonly editingCategoryId = signal<string | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    pricePerKg: new FormControl('0.00', { nonNullable: true, validators: [Validators.required] }),
    pointsPerKg: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    averageWeightKg: new FormControl('0.050', { nonNullable: true, validators: [Validators.required] }),
    isBanned: new FormControl(false, { nonNullable: true }),
    isHazardous: new FormControl(false, { nonNullable: true }),
    isAiDetectable: new FormControl(true, { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  protected openAdd(): void {
    this.editingCategoryId.set(null);
    this.form.reset({
      name: '',
      pricePerKg: '0.00',
      pointsPerKg: 1,
      averageWeightKg: '0.050',
      isBanned: false,
      isHazardous: false,
      isAiDetectable: true,
      description: '',
    });
    this.modalMode.set('add');
  }

  protected openEdit(category: WasteCategory): void {
    this.editingCategoryId.set(category.id);
    this.form.reset({
      name: category.name,
      pricePerKg: category.pricePerKg,
      pointsPerKg: category.pointsPerKg,
      averageWeightKg: category.averageWeightKg,
      isBanned: category.isBanned,
      isHazardous: category.isHazardous,
      isAiDetectable: category.isAiDetectable,
      description: category.description ?? '',
    });
    this.modalMode.set('edit');
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.editingCategoryId.set(null);
  }

  protected saveCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.wasteCategoryService.createCategory(value).subscribe({
      next: (created) => {
        this.categories.update((list) => [...list, created].sort(sortByName));
        this.closeModal();
      },
    });
  }

  protected saveEdit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.editingCategoryId();
    if (!id) return;

    this.wasteCategoryService.updateCategory(id, this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.categories.update((list) => list.map((category) => (
          category.id === updated.id ? updated : category
        )).sort(sortByName));
        this.closeModal();
      },
    });
  }

  protected deleteCategory(category: WasteCategory): void {
    this.dialogService.create({
      zTitle: 'Delete Waste Category',
      zDescription: `Are you sure you want to delete ${category.name}?`,
      zOkText: 'Delete',
      zOkDestructive: true,
      zCancelText: 'Cancel',
      zWidth: 'max-w-sm',
      zOnOk: () => {
        this.wasteCategoryService.deleteCategory(category.id).subscribe({
          next: () => this.categories.update((list) => list.filter((item) => item.id !== category.id)),
        });
      },
    });
  }

  private loadCategories(): void {
    this.wasteCategoryService.listCategories().subscribe({
      next: (list) => this.categories.set(list),
      error: () => this.categories.set([]),
    });
  }
}

function sortByName(a: WasteCategory, b: WasteCategory): number {
  return a.name.localeCompare(b.name);
}
