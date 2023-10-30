import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from 'src/app/micro-frontend/services/secret.service'
import { GetGithubActionsQuery } from 'src/generated/graphql'
import { ErrorMessageComponent } from '../../error-message/error-message.component'

@Component({
  selector: 'github-actions-service-details',
  templateUrl: 'github-actions-service-details.component.html',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, ErrorMessageComponent],
  styleUrls: ['github-actions-service-details.component.css'],
})
export class GithubActionsServiceDetailsComponent implements OnInit {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetGithubActionsQuery['getGithubActions']

  githubOrganizationUrl: string
  githubActionsRunnerGroupUrl: string
  errorMessage = signal('')

  ngOnInit(): void {
    this.githubOrganizationUrl = `${this.serviceDetails.githubInstance}/${this.serviceDetails.githubOrganization}`
    this.githubActionsRunnerGroupUrl = `${this.serviceDetails.githubInstance}/organizations/${this.serviceDetails.githubOrganization}/settings/actions/runner-groups`
  }

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/use-cases/get-access-to-github-actions.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    try {
      window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    } catch (e) {
      if (e.message) {
        this.errorMessage.set(e.message)
      } else {
        this.errorMessage.set('Unknown error')
      }
    }
    this.pendingShowInVault.set(false)
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }
}
