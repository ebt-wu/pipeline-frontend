import { CommonModule } from '@angular/common'
import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetCumulusPipelineQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cumulus-service-details',
  templateUrl: './cumulus-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrls: ['./cumulus-service-details.component.css'],
})
export class CumlusServiceDetailsComponent {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetCumulusPipelineQuery['getCumulusPipeline']

  // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
  cumulusSecretPath = 'GROUP-SECRETS/cumulus'
  pendingShowInVault = signal(false)

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
