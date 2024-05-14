import { CommonModule } from '@angular/common'
import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { Orchestrators } from '@enums'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-upgrade-banner',
  templateUrl: './upgrade-banner.component.html',
  styleUrls: ['./upgrade-banner.component.css'],
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
})
export class UpgradeBannerComponent {
  @Input()
  showBalloons = true

  constructor(private readonly luigiClient: LuigiClient) {}

  openSetupWizard(e: Event) {
    e.stopPropagation()
    await this.luigiClient
      .linkManager()
      .withParams({ orchestrator: Orchestrators.GITHUB_ACTIONS_WORKFLOW })
      .openAsModal('setup', { size: 's', title: 'Set up Build' })
  }
}
