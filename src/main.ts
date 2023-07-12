import { enableProdMode, importProvidersFrom } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'


import { environment } from './environments/environment'
import { DynatraceConfigurationService } from '@dxp/ngx-core/dynatrace'
import { AppComponent } from './app/app-component/app.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MicroFrontendModule } from './app/micro-frontend/micro-frontend.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { ContentDensityService, ThemingModule, ContentDensityModule, ContentDensityMode } from '@fundamental-ngx/core';

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
    ),
    ContentDensityService,
    provideNoopAnimations()
  ]
})
  .then((ref) => {
    const dynatraceConfigurationService = ref.injector.get(DynatraceConfigurationService)
    dynatraceConfigurationService.injectScript('').catch((err) => console.error(err))
  })
  .catch((err) => console.error(err))
