import { CommonModule } from '@angular/common'
import { Component, signal, ViewChild } from '@angular/core'
import { Validators } from '@angular/forms'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import {
  BaseDynamicFormFieldItem,
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
} from '@fundamental-ngx/platform/form'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { CredentialTypes, Languages, Orchestrators } from '@enums'
import { SecretData, SecretService } from '../../services/secret.service'
import { firstValueFrom, lastValueFrom, map } from 'rxjs'
import { SetupBuildFormValue } from '@types'
import { GithubService } from '../../services/github.service'
import { JenkinsService } from '../../services/jenkins.service'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { PiperService } from '../../services/piper.service'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../../components/form-generator-header/form-generator-header.component'
import { BuildTool } from '@generated/graphql'

export interface HeaderDynamicFormControl extends BaseDynamicFormFieldItem {
  type: 'header'
}

@Component({
  standalone: true,
  selector: 'app-setup-build',
  templateUrl: './setup-build.component.html',
  styleUrls: ['./setup-build.component.css'],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    RadioModule,
    FormModule,
    FormattedTextModule,
    FundamentalNgxPlatformModule,
    ErrorMessageComponent,
    PlatformMessagePopoverModule,
  ],
})
export class SetupComponent {
  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private luigiClient: LuigiClient,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubService: GithubService,
    private readonly jenkinsService: JenkinsService,
    private readonly piperService: PiperService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
  }

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent

  loading = false
  errorMessage = signal('')

  formCreated = false
  formValue: DynamicFormValue

  questions: DynamicFormItem<{}, HeaderDynamicFormControl>[] = [
    {
      type: 'header',
      name: 'buildToolHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Which build tool do you currently use?',
          ignoreTopMargin: true,
        },
      },
    },
    {
      type: 'radio',
      name: 'buildTool',
      message: '',
      default: async () => {
        const context = (await this.luigiService.getContextAsync()) as any
        const repoUrl = context.entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

        const ghToken = await firstValueFrom(
          this.luigiService.contextObservable().pipe(
            map((luigiContext) => {
              return luigiContext.context?.githubToolsToken
                ? {
                    value: luigiContext.context.githubToolsToken as string,
                    domain: 'github.tools.sap',
                  }
                : this.luigiClient.sendCustomMessage({
                    id: `token.request.github.tools.sap`,
                  })
            }),
          ),
        )

        if (repoUrl && ghToken) {
          const url = new URL(repoUrl)
          const languagesResp = await fetch(`${url.origin}/api/v3/repos${url.pathname}/languages`, {
            headers: {
              Authorization: `Bearer ${ghToken.value}`,
            },
          })
          const languages = await languagesResp.json()

          const languagesMap = new Map()
          for (const [key, value] of Object.entries(languages)) {
            languagesMap.set(key, value)
          }
          const sortedLanguages = new Map([...languagesMap].sort((a, b) => b[1] - a[1]))

          if (sortedLanguages.has(Languages.DOCKERFILE)) {
            return BuildTool.Docker
          }

          for (const [key, _] of sortedLanguages) {
            switch (key) {
              case Languages.JAVA:
                return BuildTool.Maven
              case Languages.GO:
                return BuildTool.Golang
              case Languages.TYPESCRIPT || Languages.JAVASCRIPT:
                return BuildTool.Npm
              case Languages.PYTHON:
                return BuildTool.Python
            }
          }
          return BuildTool.Docker
        }

        return BuildTool.Docker
      },
      guiOptions: {
        inline: true,
      },
      choices: [
        BuildTool.Docker,
        BuildTool.Golang,
        BuildTool.Gradle,
        BuildTool.Maven,
        BuildTool.Mta,
        BuildTool.Npm,
        BuildTool.Python,
      ].map((tool) => ({
        label: tool.charAt(0).toUpperCase() + tool.slice(1).toLocaleLowerCase(),
        value: tool,
      })),
      validators: [Validators.required],
    },
    {
      type: 'header',
      name: 'orchestratorHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Select an orchestrator',
        },
      },
    },
    {
      type: 'radio',
      name: 'orchestrator',
      message: '',
      choices: [Orchestrators.JENKINS],
      default: Orchestrators.JENKINS,
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'header',
      name: 'jenkinsInstanceHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Jenkins instance',
          subheader: async () => {
            return ` Don't have an instance yet?
            <a href="https://jenx.int.sap.eu2.hana.ondemand.com/#/imageOverview" target="_blank">Request one.</a>`
          },
        },
      },
    },
    {
      type: 'input',
      name: 'jenkinsUrl',
      message: 'Jenkins URL',
      placeholder: 'Enter URL',
      validate: async (value) => {
        // validate if the provided URL is a valid one
        const urlValidation =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
        const regex = new RegExp(urlValidation)
        return regex.test(value) ? null : 'Please provide a valid URL'
      },
      validators: [Validators.required],
    },
    {
      type: 'header',
      name: 'jenkinsCredentialHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Jenkins credentials',
          subheader: async () => {
            return `Your credentials are stored in Vault and needed to create a pipeline
            in your Jenkins instance.`
          },
        },
      },
    },
    {
      type: 'radio',
      name: 'jenkinsCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => value.includes('jenkins'))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => value.includes('jenkins'))
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'jenkinsUserId',
      message: 'User ID (a technical user is preferred)',
      placeholder: 'Enter ID',
      when: (formValue: any) => {
        return formValue.jenkinsCredentialType === CredentialTypes.NEW
      },
      validators: [Validators.required],
    },
    {
      type: 'password',
      controlType: 'password',
      name: 'jenkinsToken',
      message: 'Token with overall (administer) permissions.',
      placeholder: 'Enter Token',
      when: (formValue: any) => {
        return formValue.jenkinsCredentialType === CredentialTypes.NEW
      },
      validators: [Validators.required],
    },
    {
      type: 'list',
      name: 'jenkinsSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.includes('jenkins'))[0] ?? null
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.includes('jenkins'))
      },
      validators: [Validators.required],
      when: (formValue: any) => {
        return formValue.jenkinsCredentialType === CredentialTypes.EXISTING
      },
    },
    {
      type: 'header',
      name: 'githubHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'GitHub credentials',
          subheader: async () => {
            const context = (await this.luigiService.getContextAsync()) as any
            const repoName = context.entityContext?.component?.annotations['github.dxp.sap.com/repo-name'] ?? ''
            const orgName = context.entityContext?.component?.annotations['github.dxp.sap.com/login'] ?? ''
            const repoUrl = context.entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? ''
            return `Needed to configure your repository <a href="${repoUrl}" target="_blank">${orgName}/${repoName}</a>
            for your pipeline. Please use a <a href="https://github.tools.sap/settings/tokens/new" target="_blank">personal access token</a> with read and write access to your repository.`
          },
        },
      },
    },
    {
      type: 'radio',
      name: 'githubCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => value.includes('github'))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => value.includes('github'))
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'githubUserID',
      message: 'User ID (a technical user is preferred)',
      placeholder: 'Enter ID',
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.NEW
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
        const context = (await this.luigiService.getContextAsync()) as any
        const repoUrl = context.entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

        try {
          const url = new URL(repoUrl)
          const repoResp = await fetch(`${url.origin}/api/v3`, {
            headers: {
              Authorization: `Bearer ${value}`,
            },
          })

          if (repoResp.status != 200) {
            return 'Please provide a valid token.'
          }
        } catch (e) {
          return `Could not validate token: ${e.message}`
        }

        return null
      },
    },
    {
      type: 'list',
      name: 'githubSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.includes('github'))[0] ?? null
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.includes('github'))
      },
      validators: [Validators.required],
      when: (formValue: any) => {
        return formValue.githubCredentialType === CredentialTypes.EXISTING
      },
    },
  ]

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(value: SetupBuildFormValue): Promise<void> {
    const context = (await this.luigiService.getContextAsync()) as any

    // create resources - because of dependencies the order needs to be: github - jenkins - piper
    const repoUrl = context.entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login = context.entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName = context.entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''
    const githubRepoUrl = new URL(repoUrl)

    this.formValue = value
    this.loading = true

    try {
      // credentials
      let jenkinsPath: string
      let githubPath: string

      // jenkins
      if (value.jenkinsCredentialType == CredentialTypes.NEW) {
        const secretData: SecretData[] = [
          { key: 'token', value: value.jenkinsToken },
          { key: 'url', value: value.jenkinsUrl },
          { key: 'userId', value: value.jenkinsUserId },
        ]
        const jenkinsUrl = new URL(value.jenkinsUrl)
        // replace the dots in the hostname with dashes to avoid issues with vault path
        jenkinsPath = await this.storeCredential(
          `jenkins-${jenkinsUrl.hostname.replace(/\./g, '-')}`,
          secretData,
          value.jenkinsUserId,
        )
      } else if (value.jenkinsCredentialType == CredentialTypes.EXISTING) {
        jenkinsPath = this.getCredentialPath(value.jenkinsSelectCredential, context.componentId)
      }

      // github
      if (value.githubCredentialType == CredentialTypes.NEW) {
        const secretData: SecretData[] = [
          { key: 'username', value: value.githubUserID },
          { key: 'access_token', value: value.githubToken },
        ]
        githubPath = await this.storeCredential(
          // replace the dots in the hostname with dashes to avoid issues with vault path
          `${githubRepoUrl.hostname.replace(/\./g, '-')}`,
          secretData,
          value.githubUserID,
        )
        await firstValueFrom(this.secretService.writeSecret(githubPath, secretData))
      } else if (value.githubCredentialType == CredentialTypes.EXISTING) {
        githubPath = this.getCredentialPath(value.githubSelectCredential, context.componentId)
      }

      if (!repoUrl || !login || !repoName) {
        throw new Error('Could not get GitHub repository details from frame context')
      }

      const url = new URL(repoUrl)

      const repositoryResource = await firstValueFrom(
        this.githubService.createGithubRepository(url.origin, login, repoName, githubPath),
      )
      await firstValueFrom(this.jenkinsService.createJenkinsPipeline(value.jenkinsUrl, jenkinsPath, repositoryResource))
      await firstValueFrom(
        this.piperService.createPiperConfig(
          githubPath,
          repositoryResource,
          value.buildTool,
          false,
          value.buildTool === BuildTool.Docker || BuildTool.Golang || BuildTool.Gradle ? context.componentId : '',
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

  private async storeCredential(credentialPrefix: string, secretData: SecretData[], userId: string): Promise<string> {
    const path = `GROUP-SECRETS/${credentialPrefix}-${userId}`
    await firstValueFrom(this.secretService.writeSecret(path, secretData))
    return path
  }

  private getCredentialPath(selectCredentialValue: string, componentId: string): string {
    if (selectCredentialValue.includes('GROUP-SECRETS')) {
      return selectCredentialValue
    }
    return `${componentId}/${selectCredentialValue}`
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }
}
