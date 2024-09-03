import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetGithubRepositoryQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-github-service-details',
  templateUrl: './github-service-details.component.html',
  standalone: true,
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './github-service-details.component.css',
})
export class GithubServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
  ) {}

  @Input() serviceDetails: GetGithubRepositoryQuery['getGithubRepository']

  canUserEditCredentials = false
  githubInstance = ''

  loading = signal(false)

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

    const repoUrl = new URL(this.serviceDetails.repositoryUrl)
    this.githubInstance = repoUrl.origin
    this.loading.set(false)
  }

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/github.html',
      '_blank',
      'noopener, noreferrer',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank', 'noopener, noreferrer')
    this.pendingShowInVault.set(false)
  }
}
