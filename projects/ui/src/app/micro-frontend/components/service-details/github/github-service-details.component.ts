import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { GetGithubRepositoryQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { BaseServiceDetailsComponent } from '../base-service-details.component'
import { SecretService } from '../../../services/secret.service'
import { PolicyService } from '../../../services/policy.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-github-service-details',
  templateUrl: './github-service-details.component.html',
  standalone: true,
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './github-service-details.component.css',
})
export class GithubServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetGithubRepositoryQuery['getGithubRepository']

  githubInstance = ''
  loading = signal(true)
  showCredentialInfo = signal(true)

  constructor(
    protected override readonly secretService: SecretService,
    protected override readonly policyService: PolicyService,
  ) {
    super(policyService, secretService)
  }

  async ngOnInit() {
    await super.ngOnInit()
    const repoUrl = new URL(this.serviceDetails.repositoryUrl)
    this.githubInstance = repoUrl.origin

    if (!this.serviceDetails.secretPath) {
      this.showCredentialInfo.set(false)
    }

    if (!(await this.policyService.canUserEditCredentials())) {
      this.showCredentialInfo.set(false)
    }

    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/build/github.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
