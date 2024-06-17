import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core'
import {
  ButtonComponent,
  ButtonType,
  CardModule,
  DialogService,
  IllustratedMessageModule,
  MessageStripModule,
  SvgConfig,
} from '@fundamental-ngx/core'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { svgRocket } from '../../../assets/ts-svg/rocket'
import { ModalProjectGetStartedComponent } from '../modal-project-get-started/modal-project-get-started.component'
import { NgIf } from '@angular/common'
import { catchError, combineLatest, first, of } from 'rxjs'
import { ExtensionService, ScopeType, UpdateExtensionInput } from '@dxp/ngx-core/extensions'
import { CardAction, DxpActionCardModule, ImageType } from '@dxp/ngx-core/action-card'
import { ComponentSearchService } from '@dxp/ngx-core/search'

@Component({
  standalone: true,
  selector: 'app-cicd-card-project-promotion',
  templateUrl: './card-project-promotion.component.html',
  styleUrls: ['./card-project-promotion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    IllustratedMessageModule,
    NgIf,
    MessageStripModule,
    AuthorizationModule,
    ButtonComponent,
    DxpActionCardModule,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CardProjectPromotionComponent implements OnInit {
  @Input()
  set context(context: DxpContext) {
    this.currentProjectId = context.projectId
    this.dxpLuigiContextService.setContext(context)
  }

  @Input()
  LuigiClient: LuigiClient

  @Input()
  currentProjectId: string
  headerText: string = 'Setup CI/CD'
  cardButtons: CardAction[]
  readonly rocketConfig: SvgConfig = {
    spot: {
      file: svgRocket,
      id: 'rocket',
    },
  }

  constructor(
    private dxpLuigiContextService: DxpLuigiContextService,
    private dialogService: DialogService,
    private componentSearchService: ComponentSearchService,
    private extensionService: ExtensionService,
    private changeRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const q = `account:"${this.currentProjectId}"`

    combineLatest([this.dxpLuigiContextService.contextObservable(), this.componentSearchService.search(q, 1, 1)])
      .pipe(first())
      .subscribe(([ctx, components]) => {
        this.cardButtons = [
          {
            fdType: 'emphasized' as ButtonType,
            clickCallback: this.openGetStartedModal,
            disabled: components.items.length === 0,
            tooltip: components.items.length === 0 ? 'You must first create a component' : undefined,
            text: 'Set up',
          },
        ]
        if (ctx.context.entityContext.project.policies.includes('projectAdmin')) {
          this.cardButtons.push({
            fdType: 'transparent' as ButtonType,
            clickCallback: this.skipCard,
            text: 'Skip',
          })
        }
        this.changeRef.detectChanges()
      })
  }

  openGetStartedModal = () => {
    this.dialogService.open(ModalProjectGetStartedComponent, {
      focusTrapped: false,
      responsivePadding: true,
      hasBackdrop: true,
      maxWidth: '33%',
      data: {
        luigiClient: this.LuigiClient,
        currentProjectId: this.currentProjectId,
        title: 'Set up CI/CD',
      },
      position: { top: 'auto', left: 'auto' },
    })
  }

  skipCard = () => {
    this.extensionService
      .updateExtensionInstanceInProject({
        installationData: {
          skipOnboardingCard: 'true',
        },
        instanceId: 'pipeline-ui',
        extensionClass: {
          id: 'pipeline-ui',
          scope: ScopeType.PROJECT,
        },
      } as UpdateExtensionInput)
      .pipe(
        first(),
        catchError(async (error: Error) => {
          await this.LuigiClient.uxManager().showAlert({
            text: error.message,
            type: 'error',
          })
          return of(null)
        }),
      )
      .subscribe(() => {
        window.postMessage({
          msg: 'custom',
          data: { id: 'general.frame-entity-changed' },
        })
      })
  }

  public ImageType = ImageType
}
