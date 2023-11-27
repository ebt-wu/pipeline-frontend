import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { DialogService, SvgConfig } from '@fundamental-ngx/core'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'
import { svgRocket } from '../../../assets/ts-svg/rocket'
import { ModalProjectGetStartedComponent } from '../modal-project-get-started/modal-project-get-started.component'

@Component({
  selector: 'app-cicd-card-project-promotion',
  templateUrl: './card-project-promotion.component.html',
  styleUrls: ['./card-project-promotion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProjectPromotionComponent {
  @Input()
  set context(context: DxpContext) {
    this.currentProjectId = context.projectId
    this.dxpLuigiContextService.setContext(context)
  }

  @Input()
  LuigiClient: LuigiClient

  @Input()
  private currentProjectId: string

  headerText: string = 'CI/CD Setup'

  readonly rocketConfig: SvgConfig = {
    spot: {
      file: svgRocket,
      id: 'rocket',
    },
  }

  constructor(
    private dxpLuigiContextService: DxpLuigiContextService,
    private dialogService: DialogService,
  ) {}

  openGetStartedModal(e: Event): void {
    e.stopPropagation()
    this.dialogService.open(ModalProjectGetStartedComponent, {
      focusTrapped: true,
      hasBackdrop: true,
      maxWidth: '33%',
      data: {
        luigiClient: this.LuigiClient,
        currentProjectId: this.currentProjectId,
        title: '🚀 CI/CD: Get started',
      },
      position: { top: 'auto', left: 'auto' },
    })
  }
}
