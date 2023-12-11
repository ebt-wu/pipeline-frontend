import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CREATE_GITHUB_ACTIONS, GET_GITHUB_ACTIONS_CROSS_NAMESPACE } from './queries'
import {
  CreateGithubActionsMutation,
  CreateGithubActionsMutationVariables,
  GetGithubActionsCrossNamespaceQuery,
  GetGithubActionsCrossNamespaceQueryVariables,
  GithubActionsGetPayload,
} from '@generated/graphql'

@Injectable({ providedIn: 'root' })
export class GithubActionsService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createGithubActions(githubInstance: string, githubOrganization: string, secretPath: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateGithubActionsMutation, CreateGithubActionsMutationVariables>({
            mutation: CREATE_GITHUB_ACTIONS,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              githubInstance,
              githubOrganization,
              secretPath: secretPath,
            },
          })
          .pipe(map((res) => res.data?.createGithubActions ?? ''))
      }),
    )
  }

  getGithubActionsCrossNamespace(githubInstance: string, githubOrg: string): Observable<GithubActionsGetPayload> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetGithubActionsCrossNamespaceQuery, GetGithubActionsCrossNamespaceQueryVariables>({
            query: GET_GITHUB_ACTIONS_CROSS_NAMESPACE,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              githubInstance: githubInstance,
              githubOrg: githubOrg,
            },
          })
          .pipe(map((res) => res.data?.getGithubActionsCrossNamespace ?? null))
      }),
    )
  }
}
