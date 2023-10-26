import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, Observable } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CREATE_GITHUB_REPOSITORY, DELETE_GITHUB_REPOSITORY, GET_GITHUB_REPOSITORY } from './queries'
import {
  CreateGithubRepositoryMutation,
  CreateGithubRepositoryMutationVariables,
  DeleteGithubRepositoryMutation,
  DeleteGithubRepositoryMutationVariables,
  GetGithubRepositoryQuery,
  GetGithubRepositoryQueryVariables,
} from 'src/generated/graphql'

export interface GithubMetadata {
  githubInstance: string
  githubHostName: string
  githubRepoName: string
  githubRepoUrl: string
  githubOrgName: string
  githubTechnicalUserSelfServiceUrl: string
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  async getGithubMetadata(): Promise<GithubMetadata> {
    const context = await this.luigiService.getContextAsync()
    const githubRepoUrl = (context.entityContext?.component as any)?.annotations['github.dxp.sap.com/repo-url'] ?? null
    const githubRepoName =
      (context.entityContext?.component as any)?.annotations['github.dxp.sap.com/repo-name'] ?? null
    const url = new URL(githubRepoUrl)
    const githubOrgName = (context.entityContext?.component as any)?.annotations['github.dxp.sap.com/login'] ?? null

    let githubTechnicalUserSelfServiceUrl
    if (url.hostname === 'github.tools.sap') {
      githubTechnicalUserSelfServiceUrl = 'https://technical-user-management.github.tools.sap/'
    } else if (url.hostname === 'github.wdf.sap.corp') {
      githubTechnicalUserSelfServiceUrl = 'https://technical-user-management.github.tools.sap.corp/'
    }

    return {
      githubInstance: url.origin,
      githubHostName: url.hostname,
      githubRepoUrl,
      githubRepoName,
      githubOrgName,
      githubTechnicalUserSelfServiceUrl,
    }
  }

  createGithubRepository(baseUrl: string, org: string, repo: string, secretPath: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateGithubRepositoryMutation, CreateGithubRepositoryMutationVariables>({
            mutation: CREATE_GITHUB_REPOSITORY,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              baseUrl: baseUrl,
              org: org,
              repo: repo,
              secretPath: secretPath,
            },
          })
          .pipe(map((res) => res.data?.createGithubRepository ?? ''))
      }),
    )
  }

  getGithubRepository(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetGithubRepositoryQuery, GetGithubRepositoryQueryVariables>({
            query: GET_GITHUB_REPOSITORY,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getGithubRepository ?? null))
      }),
    )
  }

  deleteGithubRepository(resourceName: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteGithubRepositoryMutation, DeleteGithubRepositoryMutationVariables>({
            mutation: DELETE_GITHUB_REPOSITORY,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.deleteGithubRepository ?? ''))
      }),
    )
  }
}
