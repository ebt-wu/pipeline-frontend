import { CommonModule } from '@angular/common'
import { Component, Input, OnInit, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { SecretService } from 'src/app/micro-frontend/services/secret.service'
import { GetJenkinsPipelineQuery } from 'src/generated/graphql'

@Component({
  selector: 'jenkins-service-details',
  templateUrl: 'jenkins-service-details.component.html',
  standalone: true,
  styleUrls: ['jenkins-service-details.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class JenkinServiceDetailsComponent implements OnInit {
  constructor(private readonly secretService: SecretService) {}

  @Input() serviceDetails: GetJenkinsPipelineQuery["getJenkinsPipeline"]

  pendingShowInVault = signal(false)

  originURL: string

  ngOnInit(): void {
    const jobURL = new URL(this.serviceDetails.jobUrl)
    this.originURL = jobURL.origin
  }

  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/jenkins.html', '_blank')
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
