import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import {
  ButtonComponent,
  ButtonType,
  ColorAccent,
  IconComponent,
  InfoLabelComponent,
  InlineHelpDirective,
  ListComponent,
  ListItemComponent,
  ListLinkDirective,
  ListThumbnailDirective,
  TruncatePipe,
} from '@fundamental-ngx/core'
import { Categories, ServiceStatus } from '@enums'
import { NgIf } from '@angular/common'
import { StatusIconComponent } from './status-icon/status-icon.component'

@Component({
  selector: 'app-category-slot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthorizationModule,
    ButtonComponent,
    IconComponent,
    InfoLabelComponent,
    ListComponent,
    ListItemComponent,
    ListLinkDirective,
    InlineHelpDirective,
    ListThumbnailDirective,
    NgIf,
    TruncatePipe,
    StatusIconComponent,
  ],
  templateUrl: './category-slot.component.html',
  styleUrl: './category-slot.component.css',
})
export class CategorySlotComponent {
  @Input() category: Categories
  @Input() infoIconConfig?: {
    isIconShown?: boolean
    iconInlineHelpText?: string
  }
  @Input() configuredServicesText: string
  @Input() buttonConfig?: {
    isButtonShown: boolean
    isButtonDisabled?: boolean
    disabledButtonInlineHelpText?: string
    buttonText?: string
    buttonAction?: (e: Event) => void
    buttonTestId?: string
    buttonType?: ButtonType
  }
  @Input() statusTagConfig?: {
    isStatusTagShown: boolean
    statusTagText: string
    statusTagBackgroundColor?: ColorAccent
    statusTagInlineHelpText?: string
  }
  @Input() debugModeConfig? = { isDebugModeEnabled: false, debugModeText: 'Debug Mode' }
  @Input() isLoading?: boolean = false
  @Input() statusIconConfig?: {
    statusIconType: string
    statusIconInlineHelpText?: string
  }
  @Input() isOpenArrowShown?: boolean = false

  @Input() isServiceDetailOpen?: boolean = false

  @Input() rightSideTextConfig?: {
    rightSideText?: string
    rightSideTextInlineHelpText?: string
  }

  @Output() readonly detailsOpened = new EventEmitter<Categories>()

  protected readonly serviceStatus = ServiceStatus

  neutralColor = 10 as ColorAccent
  onDetailsOpened() {
    if (
      !this.statusIconConfig ||
      !this.statusIconConfig.statusIconType ||
      this.statusIconConfig.statusIconType === ServiceStatus.NOT_FOUND.toString() ||
      this.statusIconConfig.statusIconType === ServiceStatus.PENDING_CREATION.toString()
    ) {
      return
    }
    this.detailsOpened.emit(this.category)
  }

  get isAddButtonVisible() {
    return this.buttonConfig && this.buttonConfig.isButtonShown && !this.buttonConfig.isButtonDisabled
  }

  get testId() {
    return 'category-slot-' + this.category.replace(/ /g, '-').toLowerCase()
  }
}
