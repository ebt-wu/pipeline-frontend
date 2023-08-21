import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'

@Component({
  standalone: true,
  selector: 'error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class ErrorMessageComponent {
  constructor(private readonly luigiService: DxpLuigiContextService) {}

  @Input() title: string
  @Input() message: string

  @Output() onDismiss = new EventEmitter()

  emitOnDismiss() {
    this.onDismiss.emit()
  }

  async reportError() {
    const context = await this.luigiService.getContextAsync()
    const ghIssueURL = new URL('https://github.tools.sap/hyper-pipe/portal/issues/new')

    ghIssueURL.searchParams.append(
      'title',
      `[Portal CI/CD] ${this.title} for ${context.projectId}/${context.componentId}`
    )
    ghIssueURL.searchParams.append(
      'body',
      `Thank you for taking the time to report this error.
To help us debug, please describe what you tried to do and when the error occurred below.






### Debugging Information (automatically generated)
**Error Message:** 
\`\`\`
${this.message.trim()}
\`\`\`
**Project and component:** \`${context.projectId}/${context.componentId}\`
**Timestamp:** ${new Date()}
**User ID:** \`${context.userid}\`
`
    )
    ghIssueURL.searchParams.append('labels', ':clipboard: bug,:alien: external')

    window.open(ghIssueURL.href, '_blank')
  }
}
