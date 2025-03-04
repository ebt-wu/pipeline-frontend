import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { PpmsFoss } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-ppms-foss-service-details',
  templateUrl: './ppms-foss-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './ppms-foss-service-details.component.css',
})
export class PpmsFossServiceDetailsComponent {
  @Input() serviceDetails: PpmsFoss

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-services.html#ppms',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
