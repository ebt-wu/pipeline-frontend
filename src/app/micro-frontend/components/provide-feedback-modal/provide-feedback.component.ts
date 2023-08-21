import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormattedTextModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'

@Component({
  standalone: true,
  selector: 'provide-feedback-component',
  templateUrl: 'provide-feedback.component.html',
  styleUrls: ['provide-feedback.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, FormattedTextModule],
})
export class ProvideFeedbackComponent {
  constructor(private luigiClient: LuigiClient) {}

  openFeedbackSurvey() {
    // TODO: get correct survey links
    window.open('https://github.tools.sap/hyper-pipe/portal/issues/2623', '_blank')
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
