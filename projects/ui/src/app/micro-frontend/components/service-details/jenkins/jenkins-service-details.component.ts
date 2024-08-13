import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { BusyIndicatorModule, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetJenkinsPipelineQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-jenkins-service-details',
  templateUrl: './jenkins-service-details.component.html',
  standalone: true,
  styleUrl: './jenkins-service-details.component.css',
  imports: [BusyIndicatorModule, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
})
export class JenkinServiceDetailsComponent implements OnInit {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
  ) {}

  @Input() serviceDetails: GetJenkinsPipelineQuery['getJenkinsPipeline']

  canUserEditCredentials = false

  loading = signal(false)
  pendingShowInVault = signal(false)

  originURL: string

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

    const jobURL = new URL(this.serviceDetails.jobUrl)
    this.originURL = jobURL.origin
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/jenkins.html',
      '_blank',
      'noopoener, noreferrer',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank', 'noopoener, noreferrer')
    this.pendingShowInVault.set(false)
  }
}
