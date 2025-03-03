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
  styleUrl: './upgrade-banner.component.css',
  standalone: true,
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
})
export class UpgradeBannerComponent {
  @Input() isServiceDetailOpen: boolean
  constructor(private readonly luigiClient: LuigiClient) {}

  async openSetupWizard(e: Event) {
    e.stopPropagation()
    await this.luigiClient
      .linkManager()
      .withParams({ orchestrator: Orchestrators.GITHUB_ACTIONS_PIPELINE })
      .openAsModal('setup', { title: 'Set up Build Pipeline', width: '27rem', height: '33rem' })
  }
}
