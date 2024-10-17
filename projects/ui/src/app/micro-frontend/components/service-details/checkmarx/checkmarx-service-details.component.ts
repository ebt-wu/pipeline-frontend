import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { Checkmarx } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-checkmarx-service-details',
  templateUrl: './checkmarx-service-details.component.html',
  imports: [FundamentalNgxCoreModule],
  styleUrl: './checkmarx-service-details.component.css',
})
export class CheckmarxServiceDetailsComponent {
  constructor() {}

  @Input() serviceDetails: Checkmarx

  openDocumentation() {
    // TODO: write and link correct documentation
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation', '_blank', 'noopener,noreferrer')
  }
}
