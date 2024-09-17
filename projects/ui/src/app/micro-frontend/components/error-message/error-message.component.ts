import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
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

  @Output() readonly byDismiss = new EventEmitter()

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

    let issueDescription = this.message

    // Create a regular expression to match <br> tags
    issueDescription = this.convertHtmlElementsToMarkdownElements(issueDescription)

    const issueURL = this.githubIssueLinkService.createIssueWithContext(
      context,
      `${this.title} for ${context.projectId}/${context.componentId}`,
      issueDescription.trim(),
      {
        traces: this.tracesUrl,
        automaticdNamespace: this.automaticdNamespace,
      },
    )
    window.open(issueURL, '_blank', 'noopener, noreferrer')
  }

  private convertHtmlElementsToMarkdownElements(issueDescription: string): string {
    issueDescription = issueDescription.replace(/<\/?strong>/g, '')
    issueDescription = issueDescription.replace(/<br>/g, '\n')
    return issueDescription
  }
}
