import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { SetupComponent } from './pages/setup-build/setup-build.component'
import { AppRouterOutlet } from './components/router-outlet/router-outlet.component'
import { PipelineDebugModal } from './components/pipeline-debug/pipeline-debug.component'
import { ProvideFeedbackComponent } from './components/provide-feedback-modal/provide-feedback.component'
import { ImportExistingPipelineModal } from './components/import-existing-pipeline-modal/import-existing-pipeline.component'
import { GithubActionsComponent } from './pages/github-actions/github-actions.component'
import { CumulusInfoModalComponent } from './components/cumulus-info-modal/cumulus-info-modal.component'

const routes: Routes = [
  {
    path: 'pipeline-ui',
    component: AppRouterOutlet,
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
        path: 'github-actions',
        component: GithubActionsComponent,
      },
      {
        path: 'pipeline-debug',
        component: PipelineDebugModal,
      },
      {
        path: 'feedback',
        component: ProvideFeedbackComponent,
      },
      {
        path: 'import-pipeline',
        component: ImportExistingPipelineModal,
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
