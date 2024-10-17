import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { WhiteSource } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-whitesource-service-details',
  templateUrl: './whitesource-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './whitesource-service-details.component.css',
})
export class WhiteSourceServiceDetailsComponent {
  constructor() {}

  @Input() serviceDetails: WhiteSource

  openDocumentation() {
    // TODO: write and link correct documentation
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation', '_blank', 'noopener,noreferrer')
  }
}
