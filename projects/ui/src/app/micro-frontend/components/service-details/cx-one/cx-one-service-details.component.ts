import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { BaseServiceDetailsComponent } from '../base-service-details.component'
import { CommonModule } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { CxOne } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cx-one-service-details',
  templateUrl: './cx-one-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './cx-one-service-details.component.css',
})
export class CXOneServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: CxOne

  openDocumentation() {
    // TODO: write and link correct documentation
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation', '_blank', 'noopener,noreferrer')
  }
}
