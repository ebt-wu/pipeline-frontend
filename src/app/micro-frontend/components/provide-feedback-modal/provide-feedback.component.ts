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
    window.open(
      'https://sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com/site#feedbackservice-Display&/topic/cc5045ed-6c4e-4e7b-a18d-a0b377faf593/createFeedback',
      '_blank',
    )
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
