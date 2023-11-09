import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ContentDensityService, FundamentalNgxCoreModule, ThemingService } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { LuigiAngularSupportModule } from '@luigi-project/client-support-angular'
import { MicroFrontendRoutingModule } from './micro-frontend-routing.module'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { PipelineComponent } from './pages/pipeline/pipeline.component'
import { SetupComponent } from './pages/setup-build/setup-build.component'
import { ErrorMessageComponent } from './components/error-message/error-message.component'
import {
    PlatformFormGeneratorCustomHeaderElementComponent
} from './components/form-generator-header/form-generator-header.component'
import { DismissibleMessageComponent } from './components/dismissable-message/dismissible-message.component'
import { CumlusServiceDetailsComponent } from './components/service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from './components/service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from './components/service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from './components/service-details/piper/piper-service-details.component'
import {
    StagingServiceServiceDetailsComponent
} from './components/service-details/staging-service/staging-service-service-details.component'

@NgModule({
    providers: [ContentDensityService, ThemingService],
    imports: [
        CommonModule,
        FundamentalNgxCoreModule,
        FundamentalNgxPlatformModule,
        LuigiAngularSupportModule,
        MicroFrontendRoutingModule,
        HomePageComponent,
        ErrorMessageComponent,
        PipelineComponent,
        SetupComponent,
        DismissibleMessageComponent,
        CumlusServiceDetailsComponent,
        GithubServiceDetailsComponent,
        JenkinServiceDetailsComponent,
        PiperServiceDetailsComponent,
        StagingServiceServiceDetailsComponent,
        PlatformFormGeneratorCustomHeaderElementComponent,
    ],
})
export class MicroFrontendModule {
}
