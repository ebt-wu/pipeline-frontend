import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { Orchestrators } from '@enums'

@Component({
  selector: 'upgrade-banner',
  templateUrl: 'upgrade-banner.component.html',
  styleUrls: ['./upgrade-banner.component.css'],
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class UpgradeBannerComponent {
  @Input()
  showBalloons = true

  constructor(private readonly luigiClient: LuigiClient) {}

  openSetupWizard(e: Event) {
    e.stopPropagation()
    this.luigiClient
      .linkManager()
      .withParams({ orchestrator: Orchestrators.GITHUB_ACTIONS })
      .openAsModal('setup', { size: 's', title: 'Set up Build' })
  }
}
