import { NgIf } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core'
import { KindName } from '@constants'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { Categories, Kinds, ServiceStatus } from '@enums'
import {
  AvatarComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  IconComponent,
} from '@fundamental-ngx/core'
import { GithubActionsDetails } from '@generated/graphql'
import { CategoryConfig } from '@types'
import { ExtensionService } from '../../services/extension.service'
import { ExtensionClass } from '../../services/extension.types'
import { PolicyService } from '../../services/policy.service'
import { StatusIconComponent } from '../category-slot/status-icon/status-icon.component'
import { UpgradeBannerComponent } from '../upgrade-banner/upgrade-banner.component'

@Component({
  selector: 'app-automate-workflows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthorizationModule,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    NgIf,
    UpgradeBannerComponent,
    IconComponent,
    StatusIconComponent,
  ],
  templateUrl: './automate-workflows.component.html',
  styleUrl: './automate-workflows.component.css',
})
export class AutomateWorkflowsComponent implements OnInit {
  protected readonly Categories = Categories
  protected readonly kindName = KindName
  protected readonly kinds = Kinds

  @Input() githubActionsDetails: GithubActionsDetails
  @Input() isServiceDetailOpen: boolean
  @Input() isBuildPipelinePresent: boolean
  @Input() githubActionsExtensionData: ExtensionClass
  @Output()
  readonly detailsOpened = new EventEmitter<Categories>()

  isUserStaffed = signal(false)

  constructor(
    private readonly policyService: PolicyService,
    private readonly luigiClient: LuigiClient,
    private readonly extensionService: ExtensionService,
  ) {}

  async ngOnInit() {
    this.isUserStaffed.set(await this.policyService.isUserStaffed())
  }

  async openSetupGithubActionsModal($event: Event) {
    $event.stopPropagation()
    await this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('github-actions', {
      title: 'Enable GitHub Actions',
      width: '27rem',
      height: '19rem',
    })
  }

  openDetails(category: Categories) {
    if (this.isOpenArrowShown) {
      this.detailsOpened.emit(category)
    }
  }

  getIcon() {
    return this.extensionService.getIcon(this.githubActionsExtensionData)
  }
  get isOpenArrowShown(): boolean {
    return (
      this.githubActionsDetails &&
      this.githubActionsDetails.enablementRef &&
      this.githubActionsDetails.enablementRef.status === ServiceStatus.CREATED.toString()
    )
  }

  get statusIconConfig(): CategoryConfig['statusIconConfig'] {
    return this.githubActionsDetails && this.githubActionsDetails.enablementRef
      ? {
          statusIconType: this.githubActionsDetails.enablementRef.status,
        }
      : null
  }

  get buttonConfig(): CategoryConfig['buttonConfig'] {
    return {
      isButtonShown: (!this.githubActionsDetails || !this.githubActionsDetails.enablementRef) && this.isUserStaffed(),
      isButtonDisabled: !this.isUserStaffed(),
      buttonText: 'Enable',
      buttonAction: async (e: Event) => this.openSetupGithubActionsModal(e),
      buttonType: 'emphasized',
    }
  }

  get configuredServicesText(): string {
    return this.githubActionsDetails && this.githubActionsDetails.enablementRef ? 'GitHub Actions' : null
  }

  get rightSideTextConfig(): CategoryConfig['rightSideTextConfig'] {
    if (!this.githubActionsDetails || !this.githubActionsDetails.enablementRef) {
      return {
        rightSideText: 'Use GitHub Actions to automate workflows',
      }
    }
    return { rightSideText: null }
  }

  get isGetMoreOutOfActionsBannerShown(): boolean {
    return !this.isBuildPipelinePresent && !!(this.githubActionsDetails && this.githubActionsDetails.enablementRef)
  }
}
