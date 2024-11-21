import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetGithubActionsCrossNamespaceQuery } from '@generated/graphql'
import { ErrorMessageComponent } from '../../error-message/error-message.component'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-github-actions-service-details',
  templateUrl: './github-actions-service-details.component.html',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, ErrorMessageComponent, AuthorizationModule, InlineHelpDirective],
  styleUrl: './github-actions-service-details.component.css',
})
export class GithubActionsServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  constructor(
    protected override readonly secretService: SecretService,
    protected override readonly policyService: PolicyService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly luigiClient: LuigiClient,
  ) {
    super(policyService, secretService)
  }

  @Input() serviceDetails: GetGithubActionsCrossNamespaceQuery['getGithubActionsCrossNamespace']

  readonly ACTIONS_GET_STARTED_URL =
    'https://pages.github.tools.sap/github/features-and-usecases/features/actions/usage'
  readonly ACTIONS_SECURITY_HARDENING_URL =
    'https://pages.github.tools.sap/github/features-and-usecases/features/actions/security-hardening/'
  readonly ACTIONS_CATALOG_URL = 'https://github.tools.sap/github/actions-mirror'
  readonly SUGAR_DOCU_URL = 'https://wiki.one.int.sap/wiki/display/DevFw/SUGAR'

  githubOrganizationUrl: string
  githubActionsRunnerGroupUrl: string
  catalogUrl = signal('')
  isCurrentProjectResponsible = signal(false)
  responsibleProjectUrl = signal('')
  showActionsGetStartedWarning = signal(false)

  async ngOnInit() {
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

    await super.ngOnInit()
    if (context.projectId != this.serviceDetails.responsibleProject) {
      this.responsibleProjectUrl.set(`${context.frameBaseUrl}/projects/${this.serviceDetails.responsibleProject}`)
    }
  }

  pendingShowInVault = signal(false)

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/build/github-actions.html',
      '_blank',
      'noopener, noreferrer',
    )
  }

  async storeDismissInLocalStorage() {
    await this.luigiClient.storageManager().setItem(`actions-get-started-warning`, `dismissed at: ${Date.now()}`)
  }
}
