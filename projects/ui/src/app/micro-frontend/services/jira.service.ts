import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { GetJiraProjectsQuery, GetJiraProjectsQueryVariables, JiraProject } from '@generated/graphql'
import { GET_JIRA_PROJECTS } from './queries'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  getJiraProjects(): Observable<JiraProject[]> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      mergeMap(([client, ctx]) => {
        return client
          .query<GetJiraProjectsQuery, GetJiraProjectsQueryVariables>({
            query: GET_JIRA_PROJECTS,
            variables: {
              projectId: ctx.context.projectId,
            },
          })
          .pipe(map((res) => res.data.getJiraProjects ?? null))
      }),
    )
  }
}
