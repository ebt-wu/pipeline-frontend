import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { AzureDevOps } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-azure-service-details',
  templateUrl: './azure-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './azure-service-details.component.css',
})
export class AzureServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: AzureDevOps

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-tools.html#azure-pipelines',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
