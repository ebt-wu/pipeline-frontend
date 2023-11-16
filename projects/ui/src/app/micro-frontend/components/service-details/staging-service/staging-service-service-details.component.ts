import { CommonModule } from '@angular/common'
import { Component, Input, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetStagingServiceCredentialQuery } from '@generated/graphql'

@Component({
  selector: 'staging-service-service-details',
  templateUrl: 'staging-service-service-details.component.html',
  standalone: true,
  styleUrls: ['staging-service-service-details.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class StagingServiceServiceDetailsComponent {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetStagingServiceCredentialQuery['getStagingServiceCredential']

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/staging-service.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
