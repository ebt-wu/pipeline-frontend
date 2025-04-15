import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import {
  GetGithubActionsSolinasVerificationQuery,
  GetGithubActionsSolinasVerificationQueryVariables,
  GithubActionsDetails,
  WatchGithubActionsEnablementSubscription,
} from '@generated/graphql'
import { combineLatest, Observable, startWith } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import { BaseAPIService } from './base.service'
import { GithubService } from './github.service'
import {
  CREATE_GITHUB_ACTIONS_PIPELINE,
  CREATE_STANDALONE_GITHUB_ACTIONS_CLAIM,
  DELETE_GITHUB_ACTIONS_PIPELINE,
  GET_GITHUB_ACTIONS_SOLINAS_VERIFICATION,
  WATCH_GITHUB_ACTIONS_ENABLEMENT,
} from './queries'

@Injectable({ providedIn: 'root' })
export class GithubActionsService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly githubService: GithubService,
  ) {}

  createStandaloneGithubActionsClaim(): Observable<string> {
    return combineLatest([
      this.apiService.apollo(),
      this.luigiService.contextObservable(),
      this.githubService.getGithubMetadata(),
    ]).pipe(
      first(),
      mergeMap(([client, ctx, githubMetadata]) => {
        return client
          .mutate({
            mutation: CREATE_STANDALONE_GITHUB_ACTIONS_CLAIM,
            variables: {
              projectId: ctx.context.projectId,
              githubInstance: githubMetadata.githubInstance,
              githubOrgName: githubMetadata.githubOrgName,
            },
          })
          .pipe(map((res) => (res.data ? (res.data as string) : res.errors.map((e) => e.message).join('\n'))))
      }),
    )
  }

  createGithubActionsPipeline(githubInstance: string, githubOrgName: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate({
            mutation: CREATE_GITHUB_ACTIONS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              githubInstance,
              githubOrgName,
            },
          })
          .pipe(map((res) => (res.data ? '' : res.errors.map((e) => e.message).join('\n'))))
      }),
    )
  }

  watchGithubActionsEnablement(): Observable<GithubActionsDetails> {
    return combineLatest([this.apiService.apollo(), this.githubService.getGithubMetadata()]).pipe(
      first(),
      mergeMap(([client, githubMetadata]) => {
        return client
          .subscribe<WatchGithubActionsEnablementSubscription>({
            query: WATCH_GITHUB_ACTIONS_ENABLEMENT,
            fetchPolicy: 'no-cache',
            variables: {
              githubInstance: githubMetadata.githubInstance,
              githubOrgName: githubMetadata.githubOrgName,
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
            query: GET_GITHUB_ACTIONS_SOLINAS_VERIFICATION,
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
