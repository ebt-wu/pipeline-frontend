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
    // TODO: update with live survey links
    window.open('https://preview.userzoom.com/s/tti.aspx?s=C883S8286&sid=1', '_blank')
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
