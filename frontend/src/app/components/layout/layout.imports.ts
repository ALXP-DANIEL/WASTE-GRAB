import { ContentComponent } from '@/components/layout/content.component';
import { FooterComponent } from '@/components/layout/footer.component';
import { HeaderComponent } from '@/components/layout/header.component';
import { LayoutComponent } from '@/components/layout/layout.component';
import {
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
} from '@/components/layout/sidebar.component';

export const LayoutImports = [
  LayoutComponent,
  HeaderComponent,
  FooterComponent,
  ContentComponent,
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
] as const;
