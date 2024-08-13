import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-import-existing-pipeline-modal',
  templateUrl: './import-existing-pipeline.component.html',
  styleUrl: './import-existing-pipeline.component.scss',
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class ImportExistingPipelineModalComponent {
  constructor(private luigiClient: LuigiClient) {}

  openFeedbackSurvey() {
    window.open('https://s.userzoom.com/m/MSBDODgzUzgyODcg', '_blank', 'noopoener, noreferrer')
    this.luigiClient.uxManager().closeCurrentModal()
  }

  closeCurrentModal() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
