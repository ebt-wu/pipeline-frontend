import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ContentDensityService, FundamentalNgxCoreModule, ThemingService } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { LuigiAngularSupportModule } from '@luigi-project/client-support-angular'
import { MicroFrontendRoutingModule } from './micro-frontend-routing.module'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { PipelineComponent } from './pages/pipeline/pipeline.component'
import { SetupComponent } from './components/setup-build/setup-build.component'
import { ErrorMessageComponent } from './components/error-message/error-message.component'
import { PlatformFormGeneratorCustomHeaderElementComponent } from './components/form-generator-header/form-generator-header.component'
import { DismissibleMessageComponent } from './components/dismissible-message/dismissible-message.component'
import { CumlusServiceDetailsComponent } from './components/service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from './components/service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from './components/service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from './components/service-details/piper/piper-service-details.component'
import { StagingServiceServiceDetailsComponent } from './components/service-details/staging-service/staging-service-service-details.component'
import { PlatformFormGeneratorCustomInfoBoxComponent } from './components/form-generator-info-box/form-generator-info-box.component'
import { CumulusInfoModalComponent } from './components/cumulus-info-modal/cumulus-info-modal.component'
import { GithubActionsServiceDetailsComponent } from './components/service-details/github-actions/github-actions-service-details.component'
import { StaticSecurityCheckDetailsComponent } from './components/service-details/static-security-check/static-security-check-details.component'
import { ResourceStagePipe } from './pipes/resource-stage.pipe'
import { SetupServiceListItemComponent } from './components/setup-service-list-item/setup-service-list-item.component'

@NgModule({
  providers: [ContentDensityService, ThemingService],
  imports: [
    CommonModule,
    CumlusServiceDetailsComponent,
    CumulusInfoModalComponent,
    DismissibleMessageComponent,
    ErrorMessageComponent,
    FundamentalNgxCoreModule,
    FundamentalNgxPlatformModule,
    GithubActionsServiceDetailsComponent,
    GithubServiceDetailsComponent,
    HomePageComponent,
    JenkinServiceDetailsComponent,
    LuigiAngularSupportModule,
    MicroFrontendRoutingModule,
    PipelineComponent,
    PiperServiceDetailsComponent,
    PlatformFormGeneratorCustomHeaderElementComponent,
    PlatformFormGeneratorCustomInfoBoxComponent,
    ResourceStagePipe,
    SetupComponent,
    SetupServiceListItemComponent,
    StagingServiceServiceDetailsComponent,
    StaticSecurityCheckDetailsComponent,
  ],
})
export class MicroFrontendModule {}
