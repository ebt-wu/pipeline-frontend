import { CommonModule } from '@angular/common'
import { Component, Input, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetStagingServiceCredentialQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-staging-service-service-details',
  templateUrl: './staging-service-service-details.component.html',
  standalone: true,
  styleUrls: ['./staging-service-service-details.component.css'],
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
})
export class StagingServiceServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
  ) {}

  canUserEditCredentials = false

  @Input() serviceDetails: GetStagingServiceCredentialQuery['getStagingServiceCredential']

  loading = signal(false)
  pendingShowInVault = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()
    this.loading.set(false)
  }

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
