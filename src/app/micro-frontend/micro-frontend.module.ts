import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContentDensityService, FundamentalNgxCoreModule, ThemesService } from '@fundamental-ngx/core';
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform';
import { LuigiAngularSupportModule } from '@luigi-project/client-support-angular';
import { MicroFrontendRoutingModule } from './micro-frontend-routing.module';
import { HomePageComponent } from './pages/home-page/home-page.component';

@NgModule({
  declarations: [HomePageComponent],
  providers: [ContentDensityService, ThemesService  ],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    FundamentalNgxPlatformModule,
    LuigiAngularSupportModule,
    MicroFrontendRoutingModule,
  ],
})
export class MicroFrontendModule {}
