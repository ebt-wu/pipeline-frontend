import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { WhiteSource } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-whitesource-service-details',
  templateUrl: './whitesource-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrl: './whitesource-service-details.component.css',
})
export class WhiteSourceServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: WhiteSource

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/not-managed-services.html#mend',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
