import { Injectable } from '@angular/core'
import { lastValueFrom } from 'rxjs'
import { CredentialTypes, GithubInstances } from '@enums'
import { Validators } from '@angular/forms'
import { DynamicFormItem, FormGeneratorService } from '@fundamental-ngx/platform'
import { Secret, SecretService } from '../secret.service'
import { PolicyService } from '../policy.service'
import {
  FormGeneratorInfoBoxAdditionalData,
  PlatformFormGeneratorCustomInfoBoxComponent,
} from '../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { GithubService, REQUIRED_SCOPES } from '../github.service'
import { AddPrefixToTypeProperties } from '@types'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { FormGeneratorHeaderAdditionalData } from '../../components/form-generator/form-generator-header/form-generator-header.component'

export type GithubCredentialFormValueP<P extends string = 'github'> = AddPrefixToTypeProperties<
  GithubCredentialFormValue,
  P
>

type GithubCredentialFormValue = {
  Token?: string
  CredentialType?: CredentialTypes
  SelectCredential?: string
}

@Injectable({ providedIn: 'root' })
export class GithubCredentialFormService {
  constructor(
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
    private readonly githubService: GithubService,
    private readonly formGeneratorService: FormGeneratorService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  public buildFormItems<T extends GithubCredentialFormValueP<P>, P extends string = 'github'>(
    formItemNamePrefix: P = 'github' as P,
    showFormItems: (formValue: T) => boolean | Promise<boolean>,
  ): DynamicFormItem[] {
    return [
      {
        type: 'header',
        name: `${formItemNamePrefix}Header`,
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorHeaderAdditionalData>{
            headerText: 'Github credentials',
            ignoreBottomMargin: true,
          },
        },
        when: async (formValue: T) => {
          return await showFormItems(formValue)
        },
      },
      {
        type: 'radio',
        name: `${formItemNamePrefix}CredentialType`,
        message: '',
        default: async () => {
          const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
          if (secrets.some((value) => this.isValidGithubSecret(value))) {
            return CredentialTypes.EXISTING
          }
          return CredentialTypes.NEW
        },
        choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

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
        name: `${formItemNamePrefix}Token`,
        message: 'Personal Access Token (PAT)',
        placeholder: 'Enter service user or personal user access token',
        validators: [Validators.required],
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

          const canUserEditCredentials = await this.policyService.canUserEditCredentials()
          return formValue[`${formItemNamePrefix}CredentialType`] === CredentialTypes.NEW && canUserEditCredentials
        },
        validate: async (value: string) => {
          const githubMetadata = await this.githubService.getGithubMetadata()

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
        name: `${formItemNamePrefix}PatInfoBox`,
        message: '',
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

          const canUserEditCredentials = await this.policyService.canUserEditCredentials()
          return formValue[`${formItemNamePrefix}CredentialType`] === CredentialTypes.NEW && canUserEditCredentials
        },
        guiOptions: {
          additionalData: <FormGeneratorInfoBoxAdditionalData>{
            header: 'Instructions',
            instructions: async () => {
              const { githubTechnicalUserSelfServiceUrl, githubInstance } = await this.githubService.getGithubMetadata()
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
                  )}&description=Hyperspace%20CICD%20Setup%20Token" target="_blank">
                    Personal Access Tokens
                  </a>
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
        name: `${formItemNamePrefix}VaultMaintainerErrorStrip`,
        message: '',
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

          const canUserEditCredentials = await this.policyService.canUserEditCredentials()
          return formValue[`${formItemNamePrefix}CredentialType`] === CredentialTypes.NEW && !canUserEditCredentials
        },
        guiOptions: {
          additionalData: <FormGeneratorMessageStripAdditionalData>{
            type: 'error',
            message: async () => await this.policyService.getCantAddCredentialsErrorMessage(),
          },
        },
      },
      {
        type: 'validator',
        name: `${formItemNamePrefix}VaultMaintainerErrorStripValidator`,
        message: '',
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

          const canUserEditCredentials = await this.policyService.canUserEditCredentials()
          return formValue[`${formItemNamePrefix}CredentialType`] === CredentialTypes.NEW && !canUserEditCredentials
        },
        validate: () => "Can't finish the setup without GitHub Credentials",
      },
      {
        type: 'list',
        name: `${formItemNamePrefix}SelectCredential`,
        message: 'Credential',
        placeholder: 'Select Credential',
        default: async () => {
          const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
          const githubMetadata = await this.githubService.getGithubMetadata()
          let defaultValue: string | null = null
          if ((githubMetadata.githubHostName as GithubInstances) === GithubInstances.WDF) {
            defaultValue =
              secrets.find(
                (value) =>
                  this.isValidGithubSecret(value) && value.path.includes(GithubInstances.WDF.replace(/\./g, '-')),
              )?.path ?? null
          } else if ((githubMetadata.githubHostName as GithubInstances) === GithubInstances.TOOLS) {
            defaultValue =
              secrets.find(
                (value) =>
                  this.isValidGithubSecret(value) && value.path.includes(GithubInstances.TOOLS.replace(/\./g, '-')),
              )?.path ?? null
          }
          return defaultValue
        },
        choices: async () => {
          const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
          return secrets.filter((value) => this.isValidGithubSecret(value)).map((value) => value.path)
        },
        validators: [Validators.required],
        when: async (formValue: T) => {
          if (!(await showFormItems(formValue))) {
            return false
          }

          return formValue[`${formItemNamePrefix}CredentialType`] === CredentialTypes.EXISTING
        },
      },
    ]
  }

  private isValidGithubSecret(secret: Secret): boolean {
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
}
