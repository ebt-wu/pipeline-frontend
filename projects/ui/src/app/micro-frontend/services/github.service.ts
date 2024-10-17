import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, firstValueFrom, lastValueFrom, Observable } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import {
  CREATE_GITHUB_REPOSITORY,
  DELETE_GITHUB_REPOSITORY,
  GET_GITHUB_REPOSITORY,
  GET_REPO_LANGUAGES,
  GET_REPO_PULLS,
} from './queries'
import {
  CreateGithubRepositoryMutation,
  CreateGithubRepositoryMutationVariables,
  DeleteGithubRepositoryMutation,
  DeleteGithubRepositoryMutationVariables,
  GetGithubRepositoryQuery,
  GetGithubRepositoryQueryVariables,
} from '@generated/graphql'
import { CredentialTypes, GithubInstances } from '@enums'
import { Validators } from '@angular/forms'
import { DynamicFormItem } from '@fundamental-ngx/platform'
import { Secret, SecretData, SecretService } from './secret.service'
import { EntityContext, ghTokenFormValue, SetupBuildFormValue, ValidationLanguage } from '@types'
import { PolicyService } from './policy.service'
import { MetadataApolloClientService } from '@dxp/ngx-core/apollo'
import { ApolloQueryResult } from '@apollo/client/core'

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
    private readonly policyService: PolicyService,
    private readonly metadataService: MetadataApolloClientService,
  ) {}

  public GITHUB_CREDENTIAL_FORM: DynamicFormItem[] = [
    {
      type: 'radio',
      name: 'githubCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => this.isValidGithubSecret(value))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => this.isValidGithubSecret(value))
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'password',
      controlType: 'password',
      name: 'githubToken',
      message: 'Personal Access Token (PAT)',
      placeholder: 'Enter service user or personal user access token',
      validators: [Validators.required],
      when: async (formValue: ghTokenFormValue) => {
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      validate: async (value: string) => {
        const githubMetadata = await this.getGithubMetadata()

        try {
          const repoResp = await fetch(`${githubMetadata.githubInstance}/api/v3/user`, {
            headers: {
              Authorization: `Bearer ${value}`,
            },
          })

          if (repoResp.status != 200) {
            return 'Please provide a valid token.'
          }
          // check if all required scopes are present in the user token
          const hasRequiredScopes = REQUIRED_SCOPES.every((scope) =>
            repoResp.headers.get('X-OAuth-Scopes')?.includes(scope),
          )
          if (!hasRequiredScopes) {
            return `Please provide a token with the following scopes: ${REQUIRED_SCOPES.join(', ')}`
          }
          const user = ((await repoResp.json()) as Record<string, string>)?.login

          const response = await fetch(
            `${githubMetadata.githubInstance}/api/v3/orgs/${githubMetadata.githubOrgName}/memberships/${user}`,
            {
              headers: {
                Authorization: `Bearer ${value}`,
              },
            },
          )
          const userRole = ((await response.json()) as Record<string, unknown>)?.role

          if (userRole !== 'admin') {
            return `The user ${user} is not an owner for the organization ${githubMetadata.githubOrgName}`
          }
        } catch (error) {
          const errorMessage = (error as Error).message
          return `Could not validate token: ${errorMessage}`
        }
        return null
      },
    },
    {
      type: 'info',
      name: 'patInfoBox',
      message: '',
      when: async (formValue: ghTokenFormValue) => {
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      guiOptions: {
        additionalData: {
          header: 'Instructions',
          instructions: async () => {
            const { githubTechnicalUserSelfServiceUrl, githubInstance } = await this.getGithubMetadata()
            return `<ol>
            <li>
              <a href="${githubTechnicalUserSelfServiceUrl}" target="_blank"
                >Create a GitHub service user</a
              >
              (preferred) or use your C/I/D personal user
            </li>
            <li>Make the user <b>owner of your GitHub organization</b></li>
            <li>
              For service user only: Sign out of GitHub and select "Sign in using username
              and password" on the GitHub login page using the service users's credentials
            </li>
            <li>
              Go to
              <a href="${githubInstance}/settings/tokens/new?scopes=${REQUIRED_SCOPES.join(
                ',',
              )}&description=Hyperspace%20CICD%20Setup%20Token" target="_blank"
                >Personal Access Tokens</a
              >
              and create one. The token should have an <b>expiration date</b> (recommendation 90
              days) and have <b>full access</b> with the following scopes:
              <b>repo, admin:org, admin:org_hook, admin:repo_hook, workflow</b>
            </li>
          </ol>`
          },
        },
      },
    },
    {
      type: 'message-strip',
      name: 'githubVaultMaintainerErrorStrip',
      message: '',
      when: async (formValue: ghTokenFormValue) => {
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      validate: () => "Can't finish the setup without Github Credentials",
      guiOptions: {
        additionalData: {
          isValidationRequired: true,
          type: 'error',
          message: async () => {
            const context = await this.luigiService.getContextAsync()
            return `
              You can’t add new credentials due to missing permissions.<br/>
              You need to be „Vault Maintainer“ to maintain credentials.
              <a href="${context.frameBaseUrl}/projects/${context.projectId}/members" target="_blank" rel="noopener noreferrer">
                Contact a project owner
              </a>`
          },
        },
      },
    },
    {
      type: 'list',
      name: 'githubSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async (): Promise<string | null> => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        const githubMetadata = await this.getGithubMetadata()
        let defaultValue: string | null = null
        if ((githubMetadata.githubHostName as GithubInstances) === GithubInstances.WDF) {
          defaultValue =
            secrets.find(
              (value) =>
                this.isValidGithubSecret(value) && value.path.includes(GithubInstances.WDF.replace(/\./g, '-')),
            ).path ?? null
        } else if ((githubMetadata.githubHostName as GithubInstances) === GithubInstances.TOOLS) {
          defaultValue =
            secrets.find(
              (value) =>
                this.isValidGithubSecret(value) && value.path.includes(GithubInstances.TOOLS.replace(/\./g, '-')),
            ).path ?? null
        }
        return defaultValue
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => this.isValidGithubSecret(value)).map((value) => value.path)
      },
      validators: [Validators.required],
      when: (formValue: { githubCredentialType: string }) => {
        return formValue.githubCredentialType === CredentialTypes.EXISTING.toString()
      },
    },
  ]

  public async storeGithubCredentials(value: SetupBuildFormValue, githubRepoUrl: URL) {
    let githubSecretPath = ''

    const context = await this.luigiService.getContextAsync()
    // github
    if (value.githubCredentialType === CredentialTypes.NEW) {
      const { githubInstance } = await this.getGithubMetadata()
      const userQueryResp = await fetch(`${githubInstance}/api/v3/user`, {
        headers: {
          Authorization: `Bearer ${value.githubToken}`,
        },
      })
      const user = ((await userQueryResp.json()) as Record<string, string>)?.login
      const secretData: SecretData[] = [
        { key: 'username', value: user },
        { key: 'scopes', value: REQUIRED_SCOPES.join(',') },
        { key: 'access_token', value: value.githubToken },
      ]
      githubSecretPath = await this.secretService.storeCredential(
        // replace the dots in the hostname with dashes to avoid issues with vault path
        `${githubRepoUrl.hostname.replace(/\./g, '-')}`,
        secretData,
        user,
      )
      await firstValueFrom(this.secretService.writeSecret(githubSecretPath, secretData))
    } else if (value.githubCredentialType === CredentialTypes.EXISTING) {
      githubSecretPath = this.secretService.getCredentialPath(value.githubSelectCredential, context.componentId)
    }
    return githubSecretPath
  }

  isValidGithubSecret(secret: Secret): boolean {
    if (!secret.path.includes('github')) {
      return false
    }

    if (secret.metadata?.scopes) {
      const scopes = secret.metadata.scopes.split(',')
      return REQUIRED_SCOPES.every((val) => scopes.includes(val))
    } else {
      return true
    }
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

  createGithubRepository(
    baseUrl: string,
    org: string,
    repo: string,
    secretPath: string,
    isGithubActionsGPP: boolean,
  ): Observable<string> {
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
