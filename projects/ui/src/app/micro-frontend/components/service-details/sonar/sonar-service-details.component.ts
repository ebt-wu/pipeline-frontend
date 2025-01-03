import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../services/secret.service'
import { PolicyService } from '../../../services/policy.service'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-sonar-service-details',
  templateUrl: './sonar-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './sonar-service-details.component.css',
})
export class SonarServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
  ) {}

  @Input() serviceDetails: {
    secretPath: string
    host: string
    name: string
    creationTimestamp: string
    configString: string
  }

  canUserEditCredentials = signal(false)
  loading = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials.set(await this.policyService.canUserEditCredentials())
    this.loading.set(false)
  }

  pendingShowInVault = signal(false)

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

  getSonarProjectLink(serviceDetails: { host: string; name: string }) {
    return `${serviceDetails.host}/dashboard?id=${serviceDetails.name}`
  }
}
