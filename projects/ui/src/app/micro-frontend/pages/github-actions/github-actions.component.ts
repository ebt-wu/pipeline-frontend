import { Component, OnInit, signal, ViewChild } from '@angular/core'

import {
  BaseDynamicFormFieldItem,
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
} from '@fundamental-ngx/platform/form'
import { NgIf } from '@angular/common'
import { FundamentalNgxPlatformModule, PlatformMessagePopoverModule } from '@fundamental-ngx/platform'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { CredentialTypes } from '../../../enums'
import { Validators } from '@angular/forms'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { SecretData, SecretService } from '../../services/secret.service'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../../components/form-generator-header/form-generator-header.component'
import { BarModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { GithubActionsService } from '../../services/github-actions.service'
import { APIService } from '../../services/api.service'
import { GithubMetadata } from '../../services/github.service'

export interface HeaderDynamicFormControl extends BaseDynamicFormFieldItem {
  type: 'header'
}

@Component({
  standalone: true,
  selector: 'app-github-actions',
  templateUrl: './github-actions.component.html',
  styleUrls: ['./github-actions.component.css'],
  imports: [
    FormGeneratorComponent,
    NgIf,
    PlatformMessagePopoverModule,
    FundamentalNgxPlatformModule,
    BarModule,
    FundamentalNgxCoreModule,
    ErrorMessageComponent,
  ],
})
export class GithubActionsComponent implements OnInit {
  errorMessage = signal('')
  loading = false
  formCreated = false
  formValue: DynamicFormValue
  private githubMetadata: GithubMetadata

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  constructor(
    private luigiClient: LuigiClient,
    private readonly api: APIService,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubActionsService: GithubActionsService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
  }

  async ngOnInit() {
    this.githubMetadata = await this.api.githubService.getGithubMetadata()
  }

  githubActionFormItems: DynamicFormItem<{}, HeaderDynamicFormControl>[] = [
    {
      type: 'header',
      name: 'githubActionsHeader',
      message: '',
      guiOptions: {
        additionalData: {
          subheader: async () => {
            return `Enable Actions for the <strong>${this.githubMetadata.githubOrgName}</strong> GitHub organization. <br> <strong>This might take 3-5 minutes</strong>.`
          },
        },
      },
    },
    {
      type: 'radio',
      name: 'githubCredentialType',
      message: '',
      default: async () => {
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.NEW, CredentialTypes.EXISTING],
      when: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => value.includes(this.getGithubActionsCredentialName()))
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
      placeholder: 'Enter Token',
      validators: [Validators.required],
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.NEW
      },
      validate: async (value: string) => {
        try {
          const repoResp = await fetch(`${this.githubMetadata.githubInstance}/api/v3/user`, {
            headers: {
              Authorization: `Bearer ${value}`,
            },
          })
          const requiredScopes = ['repo', 'admin:org', 'admin:org_hook']

          if (repoResp.status != 200) {
            return 'Please provide a valid token.'
          }
          // check if all required scopes are present in the user token
          const hasRequiredScopes = requiredScopes.every(
            (scope) => repoResp.headers.get('X-OAuth-Scopes')?.includes(scope),
          )
          if (!hasRequiredScopes) {
            return `Please provide a token with the following scopes: ${requiredScopes.join(', ')}`
          }
          const user = (await repoResp.json())?.login
          // Check if 'user' matches the pattern for C,D,I User (case-insensitive). We only allow the token from a technical user.
          const pattern = /^[cdi]\d{6}$/i
          const isHumanUser = pattern.test(user)
          if (isHumanUser) {
            return `Please provide a token from a technical user. The user ${user} is a human user.`
          }
          const response = await fetch(
            `${this.githubMetadata.githubInstance}/api/v3/orgs/${this.githubMetadata.githubOrgName}/memberships/${user}`,
            {
              headers: {
                Authorization: `Bearer ${value}`,
              },
            },
          )
          const technicalUserRole = (await response.json())?.role
          if (technicalUserRole !== 'admin') {
            return `The user ${user} is not an owner for the organization ${this.githubMetadata.githubOrgName}`
          }
        } catch (e) {
          return `Could not validate token: ${e.message}`
        }
        return null
      },
    },
    {
      type: 'header',
      name: 'createNewCredentialsHeader',
      message: '',
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.NEW
      },
      guiOptions: {
        additionalData: {
          subheader: async () => {
            return `<p>Please use a Personal Access Token (PAT) from a technical user who is an owner of the GitHub Organization. The access token should have full access with the following scopes: <strong>repo, admin:org, admin:org_hook</strong>.</p>

<p>To obtain the token, please follow these steps:</p>
<ol>
   <li><a href='${this.githubMetadata.githubTechnicalUserSelfServiceUrl}' target='_blank'>Request a technical user </a> and once you have it, make sure to <a target='_blank' [href]='https://www.google.com' rel='noopener noreferrer'> sign out of GitHub </a> and select
      <strong>Sign in using username and password</strong> on the GitHub login page using the technical user's credentials.</li>
  <li>Go to <a href='${this.githubMetadata.githubInstance}/settings/tokens/new' target='_blank'>Personal Access Tokens</a> and create a PAT.</li>
</ol>
`
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
        return secrets.filter((value) => value.includes(this.getGithubActionsCredentialName()))[0] ?? null
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.includes(this.getGithubActionsCredentialName()))
      },
      validators: [Validators.required],
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.EXISTING
      },
    },
    {
      type: 'header',
      name: 'existingCredentialsHeader',
      message: '',
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.EXISTING
      },
      guiOptions: {
        additionalData: {
          subheader: async () => {
            return `<p>Please make sure that your existing credential is a Personal Access Token (PAT) from a technical user who is an owner of the GitHub Organization. The access token should have full access with the following scopes: <strong>repo, admin:org, admin:org_hook</strong>.</p>
<p>To obtain the token, follow these steps:</p>
<ol>
  <li>Log in with the technical user account.</li>
  <li>Go to <a href="${this.githubMetadata.githubInstance}/settings/tokens/new" target="_blank">Personal Access Tokens</a>.</li>
</ol>
`
          },
        },
      },
    },
  ]

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(value: DynamicFormValue): Promise<void> {
    this.formValue = value
    this.loading = true
    let githubActionsCredVaultPath: string

    try {
      if (value.githubCredentialType === CredentialTypes.NEW) {
        const secretData: SecretData[] = [{ key: 'access_token', value: value.githubToken }]
        githubActionsCredVaultPath = await this.getVaultPath()
        await firstValueFrom(this.secretService.writeSecret(githubActionsCredVaultPath, secretData))
      } else if (value.githubCredentialType === CredentialTypes.EXISTING) {
        githubActionsCredVaultPath = value.githubSelectCredential
      }
      await firstValueFrom(
        this.githubActionsService.createGithubActions(
          this.githubMetadata.githubInstance,
          this.githubMetadata.githubOrgName,
          githubActionsCredVaultPath,
        ),
      )
      this.loading = false
      this.luigiClient.uxManager().closeCurrentModal()
    } catch (e) {
      if (e.message) {
        this.errorMessage.set(e.message)
      } else {
        this.errorMessage.set('Unknown error')
      }
      this.loading = false
    }
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  private async getVaultPath(): Promise<string> {
    const path = `GROUP-SECRETS/${this.getGithubActionsCredentialName()}`
    return path
  }

  /**
   * Returns the name of the secret for the GithubActions credentials based on the github hostname. Replaces all dots in the hostname with dashes. Example: (github-tools-sap-actions).
   * @private
   */
  private getGithubActionsCredentialName() {
    return `${this.githubMetadata.githubHostName.replace(/\./g, '-')}-actions`
  }
}
