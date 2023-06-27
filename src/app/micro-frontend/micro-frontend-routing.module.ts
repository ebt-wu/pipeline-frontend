import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from './pages/home-page/home-page.component'

const routes: Routes = [
  {
    path: 'pipeline-ui',
    component: HomePageComponent,
    data: { luigiRoute: '/pipeline-ui' },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MicroFrontendRoutingModule {
  constructor() {}
}
