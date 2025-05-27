import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CxOneProject } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cx-one-project-service-details',
  templateUrl: './cx-one-project-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
  styleUrl: './cx-one-project-service-details.component.css',
})
export class CxOneProjectServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: CxOneProject

  AUDIT_CXONE_FINDINGS_DOCU_LINK = 'https://github.wdf.sap.corp/pages/Security-Testing/doc/cxone/Audit_Guide/'
  ADD_SCAN_PROJECT_CXONE_SIRIUS_DOCU_LINK = 'https://wiki.one.int.sap/wiki/x/vDQ4s'

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/cxone.html',
      '_blank',
      'noopener,noreferrer',
    )
  }
}
