import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import {
  CreateOscRegistrationMutation,
  CreateOscRegistrationMutationVariables,
  DeleteOscRegistrationMutation,
  DeleteOscRegistrationMutationVariables,
  GetOscRegistrationQuery,
  GetOscRegistrationQueryVariables,
  OpenSourceComplianceGetResponse,
} from '@generated/graphql'
import { CREATE_OPEN_SOURCE_COMPLIANCE, DELETE_OPEN_SOURCE_COMPLIANCE, GET_OPEN_SOURCE_COMPLIANCE } from './queries'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Injectable({
  providedIn: 'root',
})
export class OpenSourceComplianceService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createOpenSourceComplianceRegistration({
    jira,
    ppmsScv,
    githubBaseUrl,
    githubOrg,
    githubRepo,
    isGithubActionsGPP,
  }: {
    jira?: string
    ppmsScv?: string
    githubBaseUrl?: string
    githubOrg?: string
    githubRepo?: string
    isGithubActionsGPP?: boolean
  }): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateOscRegistrationMutation, CreateOscRegistrationMutationVariables>({
            mutation: CREATE_OPEN_SOURCE_COMPLIANCE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              jira: jira,
              ppmsScv: ppmsScv,
              githubBaseUrl: githubBaseUrl,
              githubOrg: githubOrg,
              githubRepo: githubRepo,
              isGithubActionsGPP: isGithubActionsGPP,
            },
          })
          .pipe(map((res) => res.data?.createOscRegistration ?? ''))
      }),
    )
  }

  getOpenSourceComplianceRegistration(): Observable<OpenSourceComplianceGetResponse> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetOscRegistrationQuery, GetOscRegistrationQueryVariables>({
            query: GET_OPEN_SOURCE_COMPLIANCE,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => res.data?.getOscRegistration ?? null))
      }),
    )
  }

  deleteOpenSourceComplianceRegistration(): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteOscRegistrationMutation, DeleteOscRegistrationMutationVariables>({
            mutation: DELETE_OPEN_SOURCE_COMPLIANCE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => res.data?.deleteOscRegistration ?? ''))
      }),
    )
  }
}
