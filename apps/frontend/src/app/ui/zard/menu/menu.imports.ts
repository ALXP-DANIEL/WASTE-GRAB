import { ZardContextMenuDirective } from '@/ui/zard/menu/context-menu.directive';
import { ZardMenuContentDirective } from '@/ui/zard/menu/menu-content.directive';
import { ZardMenuItemDirective } from '@/ui/zard/menu/menu-item.directive';
import { ZardMenuLabelComponent } from '@/ui/zard/menu/menu-label.component';
import { ZardMenuShortcutComponent } from '@/ui/zard/menu/menu-shortcut.component';
import { ZardMenuDirective } from '@/ui/zard/menu/menu.directive';

export const ZardMenuImports = [
  ZardContextMenuDirective,
  ZardMenuContentDirective,
  ZardMenuItemDirective,
  ZardMenuDirective,
  ZardMenuLabelComponent,
  ZardMenuShortcutComponent,
] as const;
