import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CHECK_GITHUB_ACTIONS_ENABLEMENT, CREATE_GITHUB_ACTIONS, GET_GITHUB_ACTIONS } from './queries'
import {
  CheckGithubActionsEnablementPayload,
  CheckGithubActionsEnablementQuery,
  CheckGithubActionsEnablementQueryVariables,
  CreateGithubActionsMutation,
  CreateGithubActionsMutationVariables,
  GetGithubActionsQuery,
  GetGithubActionsQueryVariables,
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

  getGithubActions(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetGithubActionsQuery, GetGithubActionsQueryVariables>({
            query: GET_GITHUB_ACTIONS,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getGithubActions ?? null))
      }),
    )
  }

  checkGithubActionsEnablement(
    githubInstance: string,
    githubOrg: string,
  ): Observable<CheckGithubActionsEnablementPayload> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<CheckGithubActionsEnablementQuery, CheckGithubActionsEnablementQueryVariables>({
            query: CHECK_GITHUB_ACTIONS_ENABLEMENT,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              githubInstance: githubInstance,
              githubOrg: githubOrg,
            },
          })
          .pipe(map((res) => res.data?.checkGithubActionsEnablement ?? null))
      }),
    )
  }
}
