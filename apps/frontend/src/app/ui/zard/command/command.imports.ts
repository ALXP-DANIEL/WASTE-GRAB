import { ZardCommandDividerComponent } from '@/ui/zard/command/command-divider.component';
import { ZardCommandEmptyComponent } from '@/ui/zard/command/command-empty.component';
import { ZardCommandInputComponent } from '@/ui/zard/command/command-input.component';
import { ZardCommandListComponent } from '@/ui/zard/command/command-list.component';
import { ZardCommandOptionGroupComponent } from '@/ui/zard/command/command-option-group.component';
import { ZardCommandOptionComponent } from '@/ui/zard/command/command-option.component';
import { ZardCommandComponent } from '@/ui/zard/command/command.component';

export const ZardCommandImports = [
  ZardCommandComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandEmptyComponent,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  ZardCommandDividerComponent,
] as const;
