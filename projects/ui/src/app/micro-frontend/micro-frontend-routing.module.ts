import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { SetupComponent } from './components/setup-build/setup-build.component'
import { AppRouterOutletComponent } from './components/router-outlet/router-outlet.component'
import { PipelineDebugModalComponent } from './components/pipeline-debug/pipeline-debug.component'
import { ImportExistingPipelineModalComponent } from './components/import-existing-pipeline-modal/import-existing-pipeline.component'
import { GithubActionsComponent } from './pages/github-actions/github-actions.component'
import { SetupValidationModalComponent } from './components/setup-validation-modal/setup-validation-modal.component'
import { CumulusInfoModalComponent } from './components/cumulus-info-modal/cumulus-info-modal.component'

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
        component: SetupComponent,
      },
      {
        path: 'setup-validation',
        component: SetupValidationModalComponent,
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
export class MicroFrontendRoutingModule {
  constructor() {}
}
