import { Injectable } from '@angular/core'
import { DxpContext } from '@dxp/ngx-core/common'

@Injectable({ providedIn: 'root' })
export class GitHubIssueLinkService {
  getIssueLink(title: string, body: string, labels?: GitHubIssueLabels[]): string {
    const githubUrl = 'https://github.tools.sap'
    const ghIssueURL = new URL(`${githubUrl}/hyperspace/yggdrasil/issues/new`)

    ghIssueURL.searchParams.append('title', `[Portal CI/CD] ${title}`)
    ghIssueURL.searchParams.append('body', body)

    if (labels) {
      ghIssueURL.searchParams.append('labels', labels.join(','))
    }

    return ghIssueURL.href
  }

  createIssueWithContext(context: DxpContext, title: string, details: string, args?: Record<string, string>): string {
    const githubUrl = 'https://github.tools.sap'
    const pipelineUrl = `${context.frameBaseUrl}/projects/${context.projectId}/components/${context.componentId}/pipeline-ui`
    const automaticdNamespaceWithLinksToTraces =
      args && args['tracesUrl'] && args['automaticdNamespace']
        ? `\n**Automaticd namespace traces:** [\`${args['automaticdNamespace']}\`](${args['tracesUrl']})\n`
        : ''
    const body = `
<!-- Thank you for taking the time to report this error.
To help us debug, please describe what you tried to do and when the error occurred below.
-->
    
### Debugging Information (automatically generated)
**Error Message:** 
\`\`\`
${details}
\`\`\`
**Project and component:** [\`${context.projectId}/${context.componentId}\`](${pipelineUrl})${automaticdNamespaceWithLinksToTraces}
**Timestamp:** ${new Date().toISOString()}
**User ID:** [\`${context.userid}\`](${githubUrl}/${context.userid})
    `
    return this.getIssueLink(title, body, [GitHubIssueLabels.BUG, GitHubIssueLabels.EXTERNAL])
  }
}

export enum GitHubIssueLabels {
  BUG = 'bug',
  EXTERNAL = 'external',
}
