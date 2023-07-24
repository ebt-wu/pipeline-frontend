import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ContentDensityService, FundamentalNgxCoreModule, ThemesService } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { LuigiAngularSupportModule } from '@luigi-project/client-support-angular'
import { MicroFrontendRoutingModule } from './micro-frontend-routing.module'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { SingleServicesComponent } from './pages/single-services/single-services.component'
import { PipelineComponent } from './pages/pipeline/pipeline.component'
import { StartComponent } from './pages/start/start.component'
import { SetupComponent } from './pages/setup-build/setup-build.component'

@NgModule({
  providers: [ContentDensityService, ThemesService],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    FundamentalNgxPlatformModule,
    LuigiAngularSupportModule,
    MicroFrontendRoutingModule,
    HomePageComponent,
    SingleServicesComponent,
    PipelineComponent,
    StartComponent,
    SetupComponent,
  ],
  declarations: [],
})
export class MicroFrontendModule {}
