import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation, signal } from '@angular/core'
import {
  CardModule,
  DialogService,
  IllustratedMessageModule,
  MessageStripModule,
  SvgConfig,
} from '@fundamental-ngx/core'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'
import { svgRocket } from '../../../assets/ts-svg/rocket'
import { ModalProjectGetStartedComponent } from '../modal-project-get-started/modal-project-get-started.component'
import { GithubService } from '../../services/github.service'
import { NgIf } from '@angular/common'
import { Subscription } from 'rxjs'

@Component({
  styleUrls: ['./card-project-promotion.component.css'],
  selector: 'app-cicd-card-project-promotion',
  templateUrl: './card-project-promotion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CardModule, IllustratedMessageModule, NgIf, MessageStripModule],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CardProjectPromotionComponent implements OnInit, OnDestroy {
  @Input()
  set context(context: DxpContext) {
    this.currentProjectId = context.projectId
    this.dxpLuigiContextService.setContext(context)
  }

  @Input()
  LuigiClient: LuigiClient

  @Input()
  currentProjectId: string

  private githubSubscription: Subscription
  headerText: string = 'CI/CD Setup'
  githubConnected = signal(false)

  readonly rocketConfig: SvgConfig = {
    spot: {
      file: svgRocket,
      id: 'rocket',
    },
  }

  constructor(
    private dxpLuigiContextService: DxpLuigiContextService,
    private dialogService: DialogService,
    private githubService: GithubService,
  ) {}
  ngOnDestroy(): void {
    this.githubSubscription.unsubscribe()
  }

  ngOnInit(): void {
    this.checkGithubConnection()
  }

  openGetStartedModal(e: Event): void {
    e.stopPropagation()
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

  private checkGithubConnection(): void {
    this.githubSubscription = this.githubService.getGithubAccounts().subscribe((accounts) => {
      accounts.length > 0 ? this.githubConnected.set(true) : this.githubConnected.set(false)
    })
  }

  openConnectGithubModal(): void {
    this.LuigiClient.linkManager().openAsModal(`/projects/${this.currentProjectId}/catalog/github?~type=github`, {
      title: 'Connect an Account',
      size: 's',
    })
  }
}
