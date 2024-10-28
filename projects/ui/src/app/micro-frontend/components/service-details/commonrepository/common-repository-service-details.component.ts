import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { BusyIndicatorComponent, FundamentalNgxCoreModule, InlineHelpDirective } from '@fundamental-ngx/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { CommonRepository } from '@generated/graphql'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-common-repository-service-details',
  templateUrl: './common-repository-service-details.component.html',
  imports: [BusyIndicatorComponent, CommonModule, FundamentalNgxCoreModule, AuthorizationModule, InlineHelpDirective],
  styleUrl: './common-repository-service-details.component.css',
})
export class CommonRepositoryServiceDetailsComponent extends BaseServiceDetailsComponent {
  @Input() serviceDetails: CommonRepository

  openDocumentation() {
    // TODO: write and link correct documentation
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation', '_blank', 'noopener,noreferrer')
  }
}
