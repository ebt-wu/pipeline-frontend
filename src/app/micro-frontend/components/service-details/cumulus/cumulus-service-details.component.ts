import { CommonModule } from '@angular/common'
import { Component, Input, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from 'src/app/micro-frontend/services/secret.service'
import { GetCumulusPipelineQuery } from 'src/generated/graphql'

@Component({
  standalone: true,
  selector: 'cumulus-service-details',
  templateUrl: 'cumulus-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule],
  styleUrls: ['cumulus-service-details.component.css'],
})
export class CumlusServiceDetailsComponent {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetCumulusPipelineQuery["getCumulusPipeline"]

  // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
  cumulusSecretPath = "GROUP-SECRETS/cumulus"
  pendingShowInVault = signal(false)
  
  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/cumulus.html', '_blank')
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
