import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, signal } from '@angular/core'
import { FundamentalNgxCoreModule, LinkModule, MessageStripType } from '@fundamental-ngx/core'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'

/**
 * Permanently dismissable message strip
 * Dismiss is stored for each component in local storage
 */
@Component({
  standalone: true,
  selector: 'dismissible-message',
  templateUrl: './dismissible-message.component.html',
  styleUrls: ['./dismissble-message.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, LinkModule],
})
export class DismissibleMessageComponent {
  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  @Input() message: string
  @Input() type: MessageStripType
  @Input() showOnlyOnce? = false
  @Input() displayLink? = false
  @Input() linkText? = ''
  @Input() href? = ''

  @Output() onDismiss = new EventEmitter()

  displayMessage = signal(false)

  async ngOnInit() {
    const context = await this.luigiService.getContextAsync()
    const item = await this.luigiClient
      .storageManager()
      .getItem(`${this.message}-${context.projectId}/${context.componentId}`)

    if (!item) {
      this.displayMessage.set(true)
    }

    if (this.showOnlyOnce) {
      this.storeDismissInLocalStorage(context)
    }
  }

  async emitOnDismiss() {
    const context = await this.luigiService.getContextAsync()
    await this.storeDismissInLocalStorage(context)
    this.onDismiss.emit()
  }

  async storeDismissInLocalStorage(context: DxpContext) {
    await this.luigiClient
      .storageManager()
      .setItem(`${this.message}-${context.projectId}/${context.componentId}`, `dismissed at: ${new Date()}`)
  }
}
