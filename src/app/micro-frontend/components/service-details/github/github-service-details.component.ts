import { CommonModule } from '@angular/common'
import { Component, Input, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from 'src/app/micro-frontend/services/secret.service'
import { GetGithubRepositoryQuery } from 'src/generated/graphql'

@Component({
  selector: 'github-service-details',
  templateUrl: 'github-service-details.component.html',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule],
  styleUrls: ['github-service-details.component.css'],
})
export class GithubServiceDetailsComponent {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetGithubRepositoryQuery["getGithubRepository"]

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/github.html', '_blank')
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
