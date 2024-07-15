import { CommonModule } from '@angular/common'
import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { FundamentalNgxCoreModule, MessageToastService } from '@fundamental-ngx/core'
import { GetPiperConfigQuery } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-piper-service-details',
  templateUrl: './piper-service-details.component.html',
  standalone: true,
  styleUrls: ['./piper-service-details.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class PiperServiceDetailsComponent {
  @Input() serviceDetails: GetPiperConfigQuery['getPiperConfig']

  constructor(public messageToastService: MessageToastService) {}

  async copyConfigStringToClipboard(config: string) {
    const cb = navigator.clipboard
    await cb.writeText(config)
    this.messageToastService.open('config.yml copied to clipboard', {
      duration: 5000,
    })
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/build/piper.html',
      '_blank',
      'noopoener, noreferrer',
    )
  }
}
