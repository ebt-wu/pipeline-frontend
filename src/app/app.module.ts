import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ContentDensityMode, ContentDensityModule, ContentDensityService, ThemingModule } from '@fundamental-ngx/core'
import { AppComponent } from './app-component/app.component'
import { AppRoutingModule } from './app-routing.module'
import { MicroFrontendModule } from './micro-frontend/micro-frontend.module'

@NgModule({
  declarations: [AppComponent],
  providers: [ContentDensityService],
  imports: [
    ThemingModule.withConfig({ themeQueryParam: 'sap-theme' }),
    ContentDensityModule.forRoot({
      storage: 'memory',
      defaultGlobalContentDensity: ContentDensityMode.COMPACT,
    }),
    AppRoutingModule,
    BrowserModule,
    MicroFrontendModule,
    NoopAnimationsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
