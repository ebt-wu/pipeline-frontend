import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { XMake } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-xmake-service-details',
  templateUrl: './xmake-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './xmake-service-details.component.css',
})
export class XMakeServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: XMake

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-tools.html#xmake',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
