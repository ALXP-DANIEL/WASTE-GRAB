import { ContentComponent } from '@/ui/zard/layout/content.component';
import { FooterComponent } from '@/ui/zard/layout/footer.component';
import { LayoutComponent } from '@/ui/zard/layout/layout.component';
import {
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
} from '@/ui/zard/layout/sidebar.component';

export const LayoutImports = [
  LayoutComponent,
  FooterComponent,
  ContentComponent,
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
] as const;
