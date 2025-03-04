import { CommonModule } from '@angular/common'
import { Component, Input, ChangeDetectionStrategy, OnInit, signal } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { GetCumulusPipelineQuery } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cumulus-service-details',
  templateUrl: './cumulus-service-details.component.html',
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './cumulus-service-details.component.css',
})
export class CumlusServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetCumulusPipelineQuery['getCumulusPipeline']

  // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
  cumulusSecretPath = 'GROUP-SECRETS/cumulus'
  loading = signal(false)
  async ngOnInit() {
    this.loading.set(true)
    await super.ngOnInit()
    this.loading.set(false)
  }
  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/build/cumulus.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
