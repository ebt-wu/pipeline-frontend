import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { BaseServiceDetailsComponent } from '../base-service-details.component'
import { CommonModule } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { CxOneProject } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-cx-one-project-service-details',
  templateUrl: './cx-one-project-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrl: './cx-one-project-service-details.component.css',
})
export class CxOneProjectServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: CxOneProject

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/cxone.html',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
