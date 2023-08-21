import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from './pages/home-page/home-page.component'
import { TechicalUserModal } from './components/technical-user/technical-user.component'
import { SetupComponent } from './pages/setup-build/setup-build.component'
import { AppRouterOutlet } from './components/router-outlet/router-outlet.component'

const routes: Routes = [
  {
    path: 'pipeline-ui',
    component: AppRouterOutlet,
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'setup',
        component: SetupComponent
      }
    ]
  },
  {
    path: 'modal',
    component: TechicalUserModal,
    data: { luigiRoute: '/modal' }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MicroFrontendRoutingModule {
  constructor() { }
}
