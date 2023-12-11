import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { first, map, mergeMap } from 'rxjs/operators'
import { combineLatest, lastValueFrom, Observable } from 'rxjs'
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
import { CredentialTypes } from '@enums'
import { Validators } from '@angular/forms'
import { DynamicFormItem } from '@fundamental-ngx/platform'
import { Secret, SecretService } from './secret.service'

export interface GithubMetadata {
  githubInstance: string
  githubHostName: string
  githubRepoName: string
  githubRepoUrl: string
  githubOrgName: string
  githubTechnicalUserSelfServiceUrl: string
}

export const REQUIRED_SCOPES = ['repo', 'admin:org', 'admin:org_hook', 'admin:repo_hook', 'workflow']

@Injectable({ providedIn: 'root' })
export class GithubService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly secretService: SecretService,
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
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.NEW
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
          const hasRequiredScopes = REQUIRED_SCOPES.every(
            (scope) => repoResp.headers.get('X-OAuth-Scopes')?.includes(scope),
          )
          if (!hasRequiredScopes) {
            return `Please provide a token with the following scopes: ${REQUIRED_SCOPES.join(', ')}`
          }
          const user = (await repoResp.json())?.login

          const response = await fetch(
            `${githubMetadata.githubInstance}/api/v3/orgs/${githubMetadata.githubOrgName}/memberships/${user}`,
            {
              headers: {
                Authorization: `Bearer ${value}`,
              },
            },
          )
          const userRole = (await response.json())?.role

          if (userRole !== 'admin') {
            return `The user ${user} is not an owner for the organization ${githubMetadata.githubOrgName}`
          }
        } catch (e) {
          return `Could not validate token: ${e.message}`
        }
        return null
      },
    },
    {
      type: 'info',
      name: 'patInfoBox',
      message: '',
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.NEW
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
      type: 'list',
      name: 'githubSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => this.isValidGithubSecret(value))[0] ?? null
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => this.isValidGithubSecret(value)).map((value) => value.path)
      },
      validators: [Validators.required],
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.EXISTING
      },
    },
  ]

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
}
