import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from '../../../../micro-frontend/services/secret.service'
import { GetJenkinsPipelineQuery } from '@generated/graphql'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-jenkins-service-details',
  templateUrl: './jenkins-service-details.component.html',
  standalone: true,
  styleUrls: ['./jenkins-service-details.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
})
export class JenkinServiceDetailsComponent implements OnInit {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetJenkinsPipelineQuery['getJenkinsPipeline']

  pendingShowInVault = signal(false)

  originURL: string

  ngOnInit(): void {
    const jobURL = new URL(this.serviceDetails.jobUrl)
    this.originURL = jobURL.origin
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/jenkins.html',
      '_blank',
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
