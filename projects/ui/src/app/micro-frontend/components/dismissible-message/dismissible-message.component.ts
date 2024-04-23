import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { FundamentalNgxCoreModule, LinkModule, MessageStripType } from '@fundamental-ngx/core'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'

/**
 * Permanently dismissible message strip
 * Dismiss is stored for each component in local storage
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-dismissible-message',
  templateUrl: './dismissible-message.component.html',
  styleUrls: ['./dismissible-message.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, LinkModule],
})
export class DismissibleMessageComponent implements OnInit {
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

  @Output() byDismiss = new EventEmitter()

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
      await this.storeDismissInLocalStorage(context)
    }
  }

  async emitByDismiss() {
    const context = await this.luigiService.getContextAsync()
    await this.storeDismissInLocalStorage(context)
    this.byDismiss.emit()
  }

  async storeDismissInLocalStorage(context: DxpContext) {
    await this.luigiClient
      .storageManager()
      .setItem(`${this.message}-${context.projectId}/${context.componentId}`, `dismissed at: ${Date.now()}`)
  }
}
