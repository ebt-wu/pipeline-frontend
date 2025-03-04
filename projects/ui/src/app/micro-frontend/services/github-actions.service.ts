import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import {
  GetGithubActionsSolinasVerificationQuery,
  GetGithubActionsSolinasVerificationQueryVariables,
  GithubActionsDetails,
  WatchGithubActionsEnablementSubscription,
} from '@generated/graphql'
import { combineLatest, Observable } from 'rxjs'
import { first, map, mergeMap, startWith } from 'rxjs/operators'
import { BaseAPIService } from './base.service'
import {
  CREATE_GITHUB_ACTIONS_PIPELINE,
  CREATE_STANDALONE_GITHUB_ACTIONS_CLAIM,
  DELETE_GITHUB_ACTIONS_PIPELINE,
  GET_GITHUB_ACTONS_SOLINAS_VERIFICATION,
  WATCH_GITHUB_ACTIONS_ENABLEMENT,
} from './queries'

@Injectable({ providedIn: 'root' })
export class GithubActionsService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createStandaloneGithubActionsClaim(): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate({
            mutation: CREATE_STANDALONE_GITHUB_ACTIONS_CLAIM,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => (res.data ? (res.data as string) : res.errors.map((e) => e.message).join('\n'))))
      }),
    )
  }

  createGithubActionsPipeline(): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate({
            mutation: CREATE_GITHUB_ACTIONS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => (res.data ? '' : res.errors.map((e) => e.message).join('\n'))))
      }),
    )
  }

  watchGithubActionsEnablement(): Observable<GithubActionsDetails> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .subscribe<WatchGithubActionsEnablementSubscription>({
            query: WATCH_GITHUB_ACTIONS_ENABLEMENT,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(
            startWith({
              data: {
                watchGithubActionsEnablement: {
                  enablementRef: null,
                  githubInstance: null,
                  githubOrgID: null,
                  githubOrgName: null,
                },
              },
            }),
            map((res) => res.data?.watchGithubActionsEnablement ?? null),
          )
      }),
    )
  }

  getGithubActionSolinasVerification(githubOrg: string, githubUrl: string): Observable<boolean> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetGithubActionsSolinasVerificationQuery, GetGithubActionsSolinasVerificationQueryVariables>({
            query: GET_GITHUB_ACTONS_SOLINAS_VERIFICATION,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              githubOrg: githubOrg,
              githubUrl: githubUrl,
            },
          })
          .pipe(map((res) => res.data?.getGithubActionsSolinasVerification ?? null))
      }),
    )
  }
  deleteGithubActionsPipeline(resourceName: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate({
            mutation: DELETE_GITHUB_ACTIONS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              resourceName,
            },
          })
          .pipe(map((res) => (res.data ? '' : res.errors.map((e) => e.message).join('\n'))))
      }),
    )
  }
}
