import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CloudFoundry } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cloud-foundry-service-details',
  templateUrl: './cloud-foundry-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrl: './cloud-foundry-service-details.component.css',
})
export class CloudFoundryServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: CloudFoundry
  @Input() pipelineID: string | undefined

  getSecretPath(secret: boolean | undefined, org: string, space: string) {
    if (secret) {
      return `GROUP-SECRETS/cloudfoundry-${org}-${space}`
    } else {
      return `PIPELINE-${this.pipelineID}/cloudfoundry-${org}-${space}`
    }
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-services.html#cloud-foundry',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
