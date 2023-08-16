import { CommonModule } from '@angular/common'
import { Component, Input, signal } from '@angular/core'
import { FlexibleColumnLayout, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { Observable } from 'rxjs'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { KindCategory, KindDocumentation, KindName } from 'src/app/constants'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  standalone: true,
  styleUrls: ['./pipeline.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, RouterModule],
})
export class PipelineComponent {
  @Input() pipeline$!: Observable<any>

  isBuildStageOpen = signal(false)

  // maps
  kindName = KindName
  kindCategory = KindCategory
  kindDocumentation = KindDocumentation

  localLayout: FlexibleColumnLayout = 'OneColumnStartFullScreen'
  activeTile: string = ""

  constructor(private readonly luigiClient: LuigiClient) {}

  openTechnicalUserModal(e: Event) {
    e.stopPropagation()
    this.luigiClient
      .linkManager()
      .fromParent()
      .openAsModal('modal', { size: 's', title: 'Build Stage: Technical User information' })
  }

  openSetupWizard(e: Event) {
    e.stopPropagation()
    this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('setup', { size: 's', title: 'Setup Build' })
  }

  openBuildStage() {
    this.isBuildStageOpen.set(!this.isBuildStageOpen())
  }

  openDetails(tile: string) {
    if (!this.activeTile) {
      this.localLayout = 'TwoColumnsMidExpanded'
      this.activeTile = tile
      return
    }
    if (this.activeTile == tile) {
      this.localLayout = this.localLayout == 'OneColumnStartFullScreen' ? 'TwoColumnsMidExpanded' : 'OneColumnStartFullScreen'
    }
    if (this.activeTile != tile) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }
    this.activeTile = tile
  }
}
