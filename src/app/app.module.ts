import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContentDensityService, ThemingModule } from '@fundamental-ngx/core';
import { AppComponent } from './app-component/app.component';
import { AppRoutingModule } from './app-routing.module';
import { MicroFrontendModule } from './micro-frontend/micro-frontend.module';

@NgModule({
  declarations: [AppComponent],
  providers: [ContentDensityService],
  imports: [
    AppRoutingModule,
    BrowserModule,
    MicroFrontendModule,
    NoopAnimationsModule,
    ThemingModule.withConfig({ themeQueryParam: 'sap-theme' })
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
