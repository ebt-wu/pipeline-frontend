import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { GitHubIssueLabels, GitHubIssueLinkService } from '../../services/github-issue-link.service'

@Component({
  standalone: true,
  selector: 'error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule],
})
export class ErrorMessageComponent {
  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
  ) {}

  @Input() type: 'warning' | 'error' = 'error'
  @Input() title: string
  @Input() message: string

  @Output() onDismiss = new EventEmitter()

  emitOnDismiss() {
    this.onDismiss.emit()
  }

  async reportError() {
    const context = await this.luigiService.getContextAsync()
    const githubUrl = 'https://github.tools.sap'
    let issueDescription = this.message

    // Create a regular expression to match <br> tags
    issueDescription = this.convertHtmlElementsToMarkdownElements(issueDescription)

    const issueURL = this.githubIssueLinkService.getIssueLink(
      `${this.title} for ${context.projectId}/${context.componentId}`,
      `
<!-- Thank you for taking the time to report this error.
To help us debug, please describe what you tried to do and when the error occurred below.
-->
    
### Debugging Information (automatically generated)
**Error Message:** 
\`\`\`
${issueDescription.trim()}
\`\`\`
**Project and component:** [\`${context.projectId}/${context.componentId}\`](${context.frameBaseUrl}/projects/${
        context.projectId
      }/components/${context.componentId}/pipeline-ui)
**Timestamp:** ${new Date()}
**User ID:** [\`${context.userid}\`](${githubUrl}/${context.userid})
    `,
      [GitHubIssueLabels.BUG, GitHubIssueLabels.EXTERNAL],
    )
    window.open(issueURL, '_blank')
  }

  private convertHtmlElementsToMarkdownElements(issueDescription: string): string {
    issueDescription = issueDescription.replace(/<\/?strong>/g, '')
    issueDescription = issueDescription.replace(/<br>/g, '\n')
    return issueDescription
  }
}
