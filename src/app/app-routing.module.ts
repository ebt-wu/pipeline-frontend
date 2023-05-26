import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  LuigiAutoRoutingService,
  LuigiPreloadComponent,
} from '@luigi-project/client-support-angular';

const routes: Routes = [
  {
    path: 'preload',
    component: LuigiPreloadComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // enableTracing: true,
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private navSvc: LuigiAutoRoutingService) {}
}
