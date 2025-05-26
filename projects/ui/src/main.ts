import { enableProdMode, importProvidersFrom } from '@angular/core'
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { AnalyticsTrackerService } from '@dxp/ngx-core/analytics-tracker'
import {
  ContentDensityMode,
  ContentDensityModule,
  ContentDensityService,
  FundamentalNgxCoreModule,
  ThemingModule,
} from '@fundamental-ngx/core'
import { AppComponent } from './app/app-component/app.component'
import { AppRoutingModule } from './app/app-routing.module'
import { MicroFrontendModule } from './app/micro-frontend/micro-frontend.module'
import {
  ApolloClientProvider,
  AppStateInitializer,
  AppStateProvider,
} from './app/micro-frontend/providers/app-state.provider'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

bootstrapApplication(AppComponent, {
  providers: [
    AppStateInitializer,
    AppStateProvider,
    ApolloClientProvider,

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
