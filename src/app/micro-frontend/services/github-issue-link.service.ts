import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class GitHubIssueLinkService {
  constructor() {}

  getIssueLink(title: string, body: string, labels?: GitHubIssueLabels[]): string {
    const githubUrl = 'https://github.tools.sap'
    const ghIssueURL = new URL(`${githubUrl}/hyper-pipe/portal/issues/new`)

    ghIssueURL.searchParams.append('title', `[Portal CI/CD] ${title}`)
    ghIssueURL.searchParams.append('body', body)

    if (labels) {
      ghIssueURL.searchParams.append('labels', labels.join(','))
    }

    return ghIssueURL.href
  }
}

export enum GitHubIssueLabels {
  BUG = ':clipboard: bug',
  EXTERNAL = ':alien: external',
  PORTAL = ':cookie: portal',
}
