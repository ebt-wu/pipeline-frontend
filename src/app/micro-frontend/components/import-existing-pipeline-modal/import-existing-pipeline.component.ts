import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'

@Component({
  standalone: true,
  selector: 'import-existing-pipeline-modal',
  templateUrl: 'import-existing-pipeline.component.html',
  styleUrls: ['import-existing-pipeline.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class ImportExistingPipelineModal {
  constructor(private luigiClient: LuigiClient) {}

  openFeedbackSurvey() {
    window.open('https://s.userzoom.com/m/MSBDODgzUzgyODcg', '_blank')
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
