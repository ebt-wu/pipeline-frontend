import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { BaseServiceDetailsComponent } from '../base-service-details.component'
import { CommonModule } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { CloudFoundry } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cloud-foundry-service-details',
  templateUrl: './cloud-foundry-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
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
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-tools.html#cloud-foundry',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
