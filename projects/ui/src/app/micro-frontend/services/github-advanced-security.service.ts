import { Injectable } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import {
  BuildTool,
  CreateGitHubAdvancedSecurityMutation,
  CreateGitHubAdvancedSecurityMutationVariables,
  DeleteGitHubAdvancedSecurityMutation,
  DeleteGitHubAdvancedSecurityMutationVariables,
  GetGitHubAdvancedSecurityQuery,
  GetGitHubAdvancedSecurityQueryVariables,
  GitHubAdvancedSecurityGetPayload,
  LabelInput,
  Orchestrators,
} from '@generated/graphql'
import {
  CREATE_GITHUB_ADVANCED_SECURITY,
  DELETE_GITHUB_ADVANCED_SECURITY,
  GET_GITHUB_ADVANCED_SECURITY,
} from './queries'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

@Injectable({
  providedIn: 'root',
})
export class GithubAdvancedSecurityService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createGithubAdvancedSecurity({
    codeScanJobOrchestrator,
    buildTool,
    labels,
  }: {
    codeScanJobOrchestrator?: Orchestrators
    buildTool?: BuildTool
    labels?: Array<LabelInput>
  }): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateGitHubAdvancedSecurityMutation, CreateGitHubAdvancedSecurityMutationVariables>({
            mutation: CREATE_GITHUB_ADVANCED_SECURITY,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              codeScanJobOrchestrator,
              buildTool,
              labels,
            },
          })
          .pipe(map((res) => res.data?.createGitHubAdvancedSecurity ?? ''))
      }),
    )
  }

  getGithubAdvancedSecurity(resourceName: string): Observable<GitHubAdvancedSecurityGetPayload> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetGitHubAdvancedSecurityQuery, GetGitHubAdvancedSecurityQueryVariables>({
            query: GET_GITHUB_ADVANCED_SECURITY,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getGitHubAdvancedSecurity ?? null))
      }),
    )
  }

  deleteGithubAdvancedSecurity(resourceName: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteGitHubAdvancedSecurityMutation, DeleteGitHubAdvancedSecurityMutationVariables>({
            mutation: DELETE_GITHUB_ADVANCED_SECURITY,
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.deleteGitHubAdvancedSecurity ?? ''))
      }),
    )
  }
}
