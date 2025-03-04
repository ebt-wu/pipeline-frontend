import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CxOneProject } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

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
