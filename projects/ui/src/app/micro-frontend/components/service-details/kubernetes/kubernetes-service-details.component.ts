import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { Kubernetes } from '@generated/graphql'
import { GithubService, GithubMetadata } from '../../../services/github.service'
import { PolicyService } from '../../../services/policy.service'
import { SecretService } from '../../../services/secret.service'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kubernetes-service-details',
  templateUrl: './kubernetes-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrl: './kubernetes-service-details.component.css',
})
export class KubernetesServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: Kubernetes
  githubRepoUrl = signal<string | undefined>(undefined)

  constructor(
    private readonly githubService: GithubService,
    protected policyService: PolicyService,
    protected secretService: SecretService,
  ) {
    super(policyService, secretService)
  }

  async ngOnInit(): Promise<void> {
    const githubMetadata: GithubMetadata = await this.githubService.getGithubMetadata()
    this.githubRepoUrl.set(githubMetadata.githubRepoUrl)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-services.html#kubernetes',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
