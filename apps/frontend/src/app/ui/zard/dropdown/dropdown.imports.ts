import { ZardDropdownMenuItemComponent } from '@/ui/zard/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@/ui/zard/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@/ui/zard/dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuComponent } from '@/ui/zard/dropdown/dropdown.component';
import { ZardMenuLabelComponent } from '@/ui/zard/menu/menu-label.component';

export const ZardDropdownImports = [
  ZardDropdownMenuComponent,
  ZardDropdownMenuItemComponent,
  ZardMenuLabelComponent,
  ZardDropdownMenuContentComponent,
  ZardDropdownDirective,
] as const;
