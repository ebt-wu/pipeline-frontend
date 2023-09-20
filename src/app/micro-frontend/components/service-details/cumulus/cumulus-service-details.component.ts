import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { GetCumulusPipelineQuery } from 'src/generated/graphql'

@Component({
  standalone: true,
  selector: 'cumulus-service-details',
  templateUrl: 'cumulus-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule],
  styleUrls: ['cumulus-service-details.component.css'],
})
export class CumlusServiceDetailsComponent {
  @Input() serviceDetails: GetCumulusPipelineQuery["getCumulusPipeline"]

  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/cumulus.html', '_blank')
  }
}
