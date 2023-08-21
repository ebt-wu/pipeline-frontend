import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { GetCumulusPipeline } from 'src/app/micro-frontend/services/cumulus.service'

@Component({
  standalone: true,
  selector: 'cumulus-service-details',
  templateUrl: 'cumulus-service-details.component.html',
  imports: [CommonModule, FundamentalNgxCoreModule],
  styleUrls: ['cumulus-service-details.component.css'],
})
export class CumlusServiceDetailsComponent {
  @Input() serviceDetails: GetCumulusPipeline

  openDocumentation() {
    window.open('https://hyperspace.tools.sap/docs/features_and_use_cases/connected_tools/cumulus.html', '_blank')
  }
}
