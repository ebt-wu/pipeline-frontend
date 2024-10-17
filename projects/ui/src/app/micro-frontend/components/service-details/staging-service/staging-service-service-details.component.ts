import { CommonModule } from '@angular/common'
import { Component, Input, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { GetStagingServiceCredentialQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-staging-service-service-details',
  templateUrl: './staging-service-service-details.component.html',
  standalone: true,
  styleUrl: './staging-service-service-details.component.css',
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
})
export class StagingServiceServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetStagingServiceCredentialQuery['getStagingServiceCredential']

  loading = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    await super.ngOnInit()
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/staging-service.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
