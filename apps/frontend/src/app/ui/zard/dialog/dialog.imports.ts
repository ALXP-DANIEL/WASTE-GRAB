import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { ZardButtonComponent } from '@/ui/zard/button';
import { ZardDialogComponent } from '@/ui/zard/dialog/dialog.component';

export const ZardDialogImports = [ZardButtonComponent, ZardDialogComponent, OverlayModule, PortalModule] as const;
