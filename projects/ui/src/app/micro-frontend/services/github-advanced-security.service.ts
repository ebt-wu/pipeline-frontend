import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Languages } from '@enums'
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
import { combineLatest, Observable } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import { Languages as GhasLanguagues } from '../../../generated/graphql'
import { BaseAPIService } from './base.service'
import {
  CREATE_GITHUB_ADVANCED_SECURITY,
  DELETE_GITHUB_ADVANCED_SECURITY,
  GET_GITHUB_ADVANCED_SECURITY,
} from './queries'

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
    language,
    labels,
  }: {
    codeScanJobOrchestrator?: Orchestrators
    buildTool?: BuildTool
    language?: Languages
    labels?: LabelInput[]
  }): Observable<string> {
    let lang: GhasLanguagues
    switch (language) {
      case Languages.JAVA:
        lang = GhasLanguagues.Java
        break
      case Languages.PYTHON:
        lang = GhasLanguagues.Python
        break
      case Languages.GO:
        lang = GhasLanguagues.Golang
        break
      case Languages.JAVA_NODE_CAP:
        lang = GhasLanguagues.Java
        break
      case Languages.OTHER:
        lang = GhasLanguagues.Unknown
        break
      default:
        // For any other language, don't set the language field on the resource
        break
    }

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
              language: lang,
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
