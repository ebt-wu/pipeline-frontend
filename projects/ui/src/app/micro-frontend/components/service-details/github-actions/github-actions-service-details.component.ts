import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetGithubActionsCrossNamespaceQuery } from '@generated/graphql'
import { ErrorMessageComponent } from '../../error-message/error-message.component'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-github-actions-service-details',
  templateUrl: './github-actions-service-details.component.html',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, ErrorMessageComponent, AuthorizationModule, InlineHelpDirective],
  styleUrls: ['./github-actions-service-details.component.css'],
})
export class GithubActionsServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly luigiClient: LuigiClient,
  ) {}

  @Input() serviceDetails: GetGithubActionsCrossNamespaceQuery['getGithubActionsCrossNamespace']

  readonly ACTIONS_GET_STARTED_URL =
    'https://pages.github.tools.sap/github/features-and-usecases/features/actions/usage'
  readonly ACTIONS_SECURITY_HARDENING_URL =
    'https://pages.github.tools.sap/github/features-and-usecases/features/actions/security-hardening/'
  readonly ACTIONS_CATALOG_URL = 'https://github.tools.sap/github/actions-mirror'
  readonly SUGAR_DOCU_URL = 'https://wiki.one.int.sap/wiki/display/DevFw/SUGAR'

  githubOrganizationUrl: string
  githubActionsRunnerGroupUrl: string
  errorMessage = signal('')
  catalogUrl = signal('')
  isCurrentProjectResponsible = signal(false)
  responsibleProjectUrl = signal('')
  showActionsGetStartedWarning = signal(false)
  isUserVaultMaintainer = false

  async ngOnInit(): Promise<void> {
    this.githubOrganizationUrl = `${this.serviceDetails.githubInstance}/${this.serviceDetails.githubOrganization}`
    this.githubActionsRunnerGroupUrl = `${this.serviceDetails.githubInstance}/organizations/${this.serviceDetails.githubOrganization}/settings/actions/runner-groups`

    const actionsGetStartedWarningDismissed = await this.luigiClient
      .storageManager()
      .getItem(`actions-get-started-warning`)

    if (!actionsGetStartedWarningDismissed) {
      this.showActionsGetStartedWarning.set(true)
    }

    const context = await this.luigiService.getContextAsync()
    this.catalogUrl.set(context.frameBaseUrl + '/catalog')

    const userPolicies = context.entityContext.project.policies
    this.isUserVaultMaintainer = userPolicies.includes('owner') || userPolicies.includes('vault_maintainer')

    if (context.projectId != this.serviceDetails.responsibleProject) {
      this.responsibleProjectUrl.set(`${context.frameBaseUrl}/projects/${this.serviceDetails.responsibleProject}`)
    }
  }

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/github-actions.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    try {
      window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage) {
        this.errorMessage.set(errorMessage)
      } else {
        this.errorMessage.set('Unknown error')
      }
    }
    this.pendingShowInVault.set(false)
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  async storeDismissInLocalStorage() {
    await this.luigiClient.storageManager().setItem(`actions-get-started-warning`, `dismissed at: ${Date.now()}`)
  }
}
