import { DoBootstrap, Injector, NgModule } from '@angular/core'
import { registerLuigiWebComponents } from '@dxp/ngx-core/luigi-webcomponent'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { CardProjectPromotionComponent } from './card-project/card-project-promotion/card-project-promotion.component'
import { ModalProjectGetStartedComponent } from './card-project/modal-project-get-started/modal-project-get-started.component'
import { ApolloModule } from 'apollo-angular'
import { HttpClientModule } from '@angular/common/http'
import { ɵSharedStylesHost } from '@angular/platform-browser'

@NgModule({
  declarations: [],
  imports: [
    ApolloModule,
    CardProjectPromotionComponent,
    FundamentalNgxCoreModule,
    HttpClientModule,
    ModalProjectGetStartedComponent,
    NoopAnimationsModule,
  ],
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
    this.injector.get(ɵSharedStylesHost).removeHost(document.head)
  }

  ngDoBootstrap(): void {
    registerLuigiWebComponents(
      {
        'cicd-project-promotion-card': CardProjectPromotionComponent,
        'cicd-project-getstarted-modal': ModalProjectGetStartedComponent,
      },
      this.injector,
    )
  }
}
