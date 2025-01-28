import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, firstValueFrom, Observable } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CREATE_GITHUB_REPOSITORY, DELETE_GITHUB_REPOSITORY, GET_GITHUB_REPOSITORY } from './queries'
import {
  CreateGithubRepositoryMutation,
  CreateGithubRepositoryMutationVariables,
  DeleteGithubRepositoryMutation,
  DeleteGithubRepositoryMutationVariables,
  GetGithubRepositoryQuery,
  GetGithubRepositoryQueryVariables,
} from '@generated/graphql'
import { CredentialTypes, GithubInstances } from '@enums'
import { SecretData, SecretService } from './secret.service'
import { EntityContext, ValidationLanguage } from '@types'
import { MetadataApolloClientService } from '@dxp/ngx-core/apollo'
import { ApolloQueryResult } from '@apollo/client/core'
import { GET_REPO_LANGUAGES, GET_REPO_PULLS } from './external-queries'
import { GithubCredentialFormValueP } from './forms/github-credential-form.service'

export interface GithubMetadata {
  githubInstance: string
  githubHostName: string
  githubRepoName: string
  githubRepoUrl: string
  githubOrgName: string
  githubTechnicalUserSelfServiceUrl: string
}

export type LanguageQueryResult = {
  component: {
    extensions: {
      languages: {
        Languages: { Name: string; Bytes: number }[]
      }
    }
  }
}

export type PullRequestQueryResult = {
  watchComponent: {
    extensions: {
      repository: {
        openPullRequests: {
          title: string
        }[]
      }
    }
  }
}

export const REQUIRED_SCOPES = ['repo', 'admin:org', 'admin:org_hook', 'admin:repo_hook', 'workflow']

@Injectable({ providedIn: 'root' })
export class GithubService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly secretService: SecretService,
    private readonly metadataService: MetadataApolloClientService,
  ) {}

  public async storeGithubCredentials(formValue: GithubCredentialFormValueP, githubRepoUrl: URL) {
    let githubSecretPath = ''

    const context = await this.luigiService.getContextAsync()
    // github
    if (formValue.githubCredentialType === CredentialTypes.NEW) {
      const { githubInstance } = await this.getGithubMetadata()
      const userQueryResp = await fetch(`${githubInstance}/api/v3/user`, {
        headers: {
          Authorization: `Bearer ${formValue.githubToken}`,
        },
      })
      const user = ((await userQueryResp.json()) as Record<string, string>)?.login
      const secretData: SecretData[] = [
        { key: 'username', value: user },
        { key: 'scopes', value: REQUIRED_SCOPES.join(',') },
        { key: 'access_token', value: formValue.githubToken },
      ]
      githubSecretPath = await this.secretService.storeCredential(
        // replace the dots in the hostname with dashes to avoid issues with vault path
        `${githubRepoUrl.hostname.replace(/\./g, '-')}`,
        secretData,
        user,
      )
      await firstValueFrom(this.secretService.writeSecret(githubSecretPath, secretData))
    } else if (formValue.githubCredentialType === CredentialTypes.EXISTING) {
      githubSecretPath = this.secretService.getCredentialPath(formValue.githubSelectCredential, context.componentId)
    }
    return githubSecretPath
  }

  async getGithubMetadata(): Promise<GithubMetadata> {
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext
    const githubRepoUrl = entityContext?.component.annotations['github.dxp.sap.com/repo-url'] ?? null
    const githubRepoName = entityContext?.component?.annotations['github.dxp.sap.com/repo-name'] ?? null
    const url = new URL(githubRepoUrl)
    const githubOrgName = entityContext?.component?.annotations['github.dxp.sap.com/login'] ?? null

    let githubTechnicalUserSelfServiceUrl: string
    if ((url.hostname as GithubInstances) === GithubInstances.TOOLS) {
      githubTechnicalUserSelfServiceUrl = 'https://technical-user-management.github.tools.sap/'
    } else if ((url.hostname as GithubInstances) === GithubInstances.WDF) {
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

  createGithubRepository(baseUrl: string, org: string, repo: string, isGithubActionsGPP: boolean): Observable<string> {
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
              isGithubActionsGPP: isGithubActionsGPP,
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

  getRepositoryLanguages() {
    // see metadata schema here: https://github.tools.sap/dxp/metadata-registry-service/blob/main/graph/schema.graphql
    return combineLatest([this.metadataService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([apollo, ctx]) => {
        return apollo
          .query({
            query: GET_REPO_LANGUAGES,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              tenantId: ctx.context.tenantid,
            },
          })
          .pipe(
            map(
              (res: ApolloQueryResult<LanguageQueryResult>) =>
                res.data.component?.extensions?.languages?.Languages ?? undefined,
            ),
          )
      }),
    )
  }

  /**
   * Gets the most used language from the languages found in the repo
   * returns either the language or 'other' if none of the languages is in the allowedLanguages
   */
  getMostUsedLanguage(
    languages: { Name: string; Bytes: number }[],
    allowedLanguages: ValidationLanguage[],
  ): ValidationLanguage {
    if (!languages) {
      return allowedLanguages.find((lang) => lang.id === 'other')
    }

    let mostUsedLanguage = { Name: 'other', Bytes: 0 }
    for (const language of languages) {
      if (language.Bytes > mostUsedLanguage.Bytes) {
        mostUsedLanguage = language
      }
    }
    return (
      allowedLanguages.find((lang) => lang.id === mostUsedLanguage.Name.toLowerCase()) ??
      allowedLanguages.find((lang) => lang.id === 'other')
    )
  }

  getPullRequestInfo() {
    // see metadata schema here: https://github.tools.sap/dxp/metadata-registry-service/blob/main/graph/schema.graphql
    return combineLatest([this.metadataService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([apollo, ctx]) => {
        return apollo
          .subscribe({
            query: GET_REPO_PULLS,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              tenantId: ctx.context.tenantid,
            },
          })
          .pipe(
            map((res: ApolloQueryResult<PullRequestQueryResult>) => {
              return (
                (res.data.watchComponent.extensions?.repository?.openPullRequests as { title: string }[]) ?? undefined
              )
            }),
          )
      }),
    )
  }
}
