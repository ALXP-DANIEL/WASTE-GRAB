import { ZardTreeNodeContentComponent } from '@/ui/zard/tree/tree-node-content.component';
import { ZardTreeNodeToggleDirective } from '@/ui/zard/tree/tree-node-toggle.directive';
import { ZardTreeNodeComponent } from '@/ui/zard/tree/tree-node.component';
import { ZardTreeComponent } from '@/ui/zard/tree/tree.component';

export const ZardTreeImports = [
  ZardTreeComponent,
  ZardTreeNodeComponent,
  ZardTreeNodeToggleDirective,
  ZardTreeNodeContentComponent,
] as const;
