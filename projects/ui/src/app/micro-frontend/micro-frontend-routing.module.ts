import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ImportExistingPipelineModalComponent } from './components/import-existing-pipeline-modal/import-existing-pipeline.component'
import { PipelineDebugModalComponent } from './components/pipeline-debug/pipeline-debug.component'
import { AppRouterOutletComponent } from './components/router-outlet/router-outlet.component'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { CumulusInfoModalComponent } from './pages/modals/cumulus-info-modal/cumulus-info-modal.component'
import { SetupBuildComponent } from './pages/modals/setup-build/setup-build.component'
import { SetupGhasModalComponent } from './pages/modals/setup-ghas-modal/setup-ghas-modal.component'
import { GithubActionsComponent } from './pages/modals/setup-github-actions/setup-github-actions.component'
import { SetupOSCModalComponent } from './pages/modals/setup-osc-modal/setup-osc-modal.component'
import { StaticCodeChecksComponent } from './pages/modals/static-code-checks-modal/static-code-checks.component'
import { StaticCodeChecksNoBuildModalComponent } from './pages/modals/static-code-checks-no-build-modal/static-code-checks-no-build-modal.component'
import { StaticSecurityChecksComponent } from './pages/modals/static-security-checks-modal/static-security-checks.component'

const routes: Routes = [
  {
    path: 'pipeline-ui',
    component: AppRouterOutletComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'setup',
        component: SetupBuildComponent,
      },
      {
        path: 'setup-static-security-checks',
        component: StaticSecurityChecksComponent,
      },
      {
        path: 'setup-static-code-checks',
        component: StaticCodeChecksComponent,
      },
      {
        path: 'static-code-checks-no-build',
        component: StaticCodeChecksNoBuildModalComponent,
      },
      {
        path: 'setup-ghas',
        component: SetupGhasModalComponent,
      },
      {
        path: 'setup-osc',
        component: SetupOSCModalComponent,
      },
      {
        path: 'github-actions',
        component: GithubActionsComponent,
      },
      {
        path: 'pipeline-debug',
        component: PipelineDebugModalComponent,
      },
      {
        path: 'import-pipeline',
        component: ImportExistingPipelineModalComponent,
      },
      {
        path: 'cumulus-info',
        component: CumulusInfoModalComponent,
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MicroFrontendRoutingModule {}
