import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule, InlineHelpDirective, MessageToastService } from '@fundamental-ngx/core'
import { PolicyService } from '../../../services/policy.service'
import { SecretService } from '../../../services/secret.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sonar-service-details',
  templateUrl: './sonar-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './sonar-service-details.component.css',
})
export class SonarServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
    public messageToastService: MessageToastService,
  ) {}

  @Input() serviceDetails: {
    secretPath: string
    host: string
    name: string
    key: string
    creationTimestamp: string
    configString: string
    hasInactiveUsers: boolean
  }

  canUserEditCredentials = signal(false)
  loading = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials.set(await this.policyService.canUserEditCredentials())
    this.loading.set(false)
  }

  pendingShowInVault = signal(false)

  async copyConfigStringToClipboard(config: string) {
    const cb = navigator.clipboard
    await cb.writeText(config)
    this.messageToastService.open('config.yml copied to clipboard', {
      duration: 5000,
    })
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/sonarqube.html',
      '_blank',
      'noopener,noreferrer',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank', 'noopener, noreferrer')
    this.pendingShowInVault.set(false)
  }

  getSonarProjectLink(serviceDetails: { host: string; key: string }) {
    return `${serviceDetails.host}/dashboard?id=${serviceDetails.key}`
  }
}
