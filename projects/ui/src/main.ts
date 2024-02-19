import { enableProdMode, importProvidersFrom } from '@angular/core'
import { environment } from './environments/environment'
import { AppComponent } from './app/app-component/app.component'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MicroFrontendModule } from './app/micro-frontend/micro-frontend.module'
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser'
import { AppRoutingModule } from './app/app-routing.module'
import {
  ContentDensityService,
  ThemingModule,
  ContentDensityModule,
  ContentDensityMode,
  FundamentalNgxCoreModule,
} from '@fundamental-ngx/core'
import { AnalyticsTrackerService } from '@dxp/ngx-core/analytics-tracker'

if (environment.production) {
  enableProdMode()
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      ThemingModule.withConfig({ themeQueryParam: 'sap-theme', defaultTheme: 'sap_horizon' }),
      ContentDensityModule.forRoot({
        storage: 'memory',
        defaultGlobalContentDensity: ContentDensityMode.COMPACT,
      }),
      AppRoutingModule,
      BrowserModule,
      MicroFrontendModule,
      FundamentalNgxCoreModule,
    ),
    ContentDensityService,
    provideNoopAnimations(),
  ],
})
  .then((ref) => {
    const analyticsTrackerService = ref.injector.get(AnalyticsTrackerService)
    analyticsTrackerService.injectScript().catch((err) => console.error(err))
  })
  .catch((err) => console.error(err))
