import { CommonModule } from '@angular/common'
import { Component, Input, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetCumulusPipelineQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cumulus-service-details',
  templateUrl: './cumulus-service-details.component.html',
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrls: ['./cumulus-service-details.component.css'],
})
export class CumlusServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  @Input() serviceDetails: GetCumulusPipelineQuery['getCumulusPipeline']

  // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
  cumulusSecretPath = 'GROUP-SECRETS/cumulus'
  isUserVaultMaintainer = false
  loading = signal(false)
  pendingShowInVault = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    const userPolicies = (await this.luigiService.getContextAsync()).entityContext.project.policies
    this.isUserVaultMaintainer = userPolicies.includes('owner') || userPolicies.includes('vault_maintainer')
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/cumulus.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
