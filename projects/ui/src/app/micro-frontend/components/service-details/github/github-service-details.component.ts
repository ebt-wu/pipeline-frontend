import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetGithubRepositoryQuery } from '@generated/graphql'

@Component({
  selector: 'github-service-details',
  templateUrl: 'github-service-details.component.html',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule],
  styleUrls: ['github-service-details.component.css'],
})
export class GithubServiceDetailsComponent implements OnInit {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetGithubRepositoryQuery['getGithubRepository']

  githubInstance = ''

  ngOnInit(): void {
    const repoUrl = new URL(this.serviceDetails.repositoryUrl)
    this.githubInstance = repoUrl.origin
  }

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/github.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
