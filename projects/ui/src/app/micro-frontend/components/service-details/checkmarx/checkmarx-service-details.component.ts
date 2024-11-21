import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { Checkmarx } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'
import { CommonModule } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-checkmarx-service-details',
  templateUrl: './checkmarx-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './checkmarx-service-details.component.css',
})
export class CheckmarxServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: Checkmarx

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-services.html#checkmarx-cxsast',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
