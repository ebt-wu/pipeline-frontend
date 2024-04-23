import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnInit, Output, signal, ChangeDetectionStrategy } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { GitHubIssueLabels, GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, AuthorizationModule],
})
export class ErrorMessageComponent implements OnInit {
  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
    readonly debugModeService: DebugModeService,
  ) {}

  @Input() type: 'warning' | 'error' = 'error'
  @Input() title: string
  @Input() message: string
  @Input() automaticdNamespace?: string
  @Input() automaticdResourceName?: string
  @Input() tracesUrl?: string

  troubleshootURL = signal('')

  @Output() byDismiss = new EventEmitter()

  ngOnInit() {
    // check messages for error codes to link to troubleshooting instructions instead of offering the option to create a ticket
    if (
      this.message.includes('GITHUB-ACTION-6') ||
      this.message.includes('GITHUB-ACTION-2') ||
      this.message.includes('GITHUB-4')
    ) {
      this.troubleshootURL.set(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/how-tos/use-github-PAT.html#replacing-an-invalid-personal-access-token',
      )
    }
  }

  emitByDismiss() {
    this.byDismiss.emit()
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
${
  this.tracesUrl && this.automaticdNamespace
    ? `**Automaticd namespace traces:** [\`${this.automaticdNamespace}\`](${this.tracesUrl})`
    : ''
}
**Timestamp:** ${Date.now()}
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
