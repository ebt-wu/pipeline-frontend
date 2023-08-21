import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule, MessageToastService } from '@fundamental-ngx/core'
import { GetPiperConfig } from 'src/app/micro-frontend/services/piper.service'

@Component({
  selector: 'piper-service-details',
  templateUrl: 'piper-service-details.component.html',
  standalone: true,
  styleUrls: ['piper-service-details.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class PiperServiceDetailsComponent {
  @Input() serviceDetails: GetPiperConfig

  constructor(public messageToastService: MessageToastService) {}

  copyConfigStringToClipboard(config: string) {
    const cb = navigator.clipboard
    cb.writeText(config)
    this.messageToastService.open('config.yml copied to clipboard', {
      duration: 5000,
    })
  }

  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/piper.html', '_blank')
  }
}
