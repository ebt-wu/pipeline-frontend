import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import {
  BusyIndicatorComponent,
  ButtonComponent,
  IconComponent,
  InfoLabelComponent,
  InlineHelpDirective,
  ListComponent,
  ListItemComponent,
  ListLinkDirective,
  ListThumbnailDirective,
  ObjectStatusComponent,
  TruncatePipe,
} from '@fundamental-ngx/core'
import { Categories, ServiceStatus } from '@enums'
import { NgIf } from '@angular/common'

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
    BusyIndicatorComponent,
    ObjectStatusComponent,
    TruncatePipe,
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
    buttonAction?: () => void
  }
  @Input() statusTagConfig?: {
    isStatusTagShown: boolean
    statusTagText: string
  }
  @Input() debugModeConfig? = { isDebugModeEnabled: false, debugModeText: 'Debug Mode' }
  @Input() isLoading?: boolean = false
  @Input() statusIconConfig?: {
    statusIconType: ServiceStatus
    statusIconInlineHelpText?: string
  }
  @Input() isOpenArrowShown?: boolean = false

  @Input() isServiceDetailOpen?: boolean = false

  @Input() rightSideText?: string

  @Output() readonly detailsOpened = new EventEmitter<Categories>()

  protected readonly serviceStatus = ServiceStatus

  onDetailsOpened() {
    if (!this.statusIconConfig || !this.statusIconConfig.statusIconType) {
      return
    }
    this.detailsOpened.emit(this.category)
  }

  get isAddButtonVisible() {
    return this.buttonConfig && this.buttonConfig.isButtonShown && !this.buttonConfig.isButtonDisabled
  }
}
