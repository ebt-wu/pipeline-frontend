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
    // TODO: update with live survey link
    window.open('https://preview.userzoom.com/mpaap/MTAgQzg4M1M4Mjg3/1', '_blank')
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
