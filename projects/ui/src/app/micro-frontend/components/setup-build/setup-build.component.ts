import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core'
import { Validators } from '@angular/forms'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import {
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
} from '@fundamental-ngx/platform/form'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { CredentialTypes, Languages, Orchestrators } from '@enums'
import { Pipeline } from '@types'
import { SecretData, SecretService } from '../../services/secret.service'
import { debounceTime, firstValueFrom, lastValueFrom, Subscription, Observable } from 'rxjs'
import { EntityContext, SetupBuildFormValue } from '@types'
import { GithubService } from '../../services/github.service'
import { JenkinsService } from '../../services/jenkins.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { PiperService } from '../../services/piper.service'
import { BuildTool } from '@generated/graphql'
import { getNodeParams } from '@luigi-project/client'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../form-generator/form-generator-header/form-generator-header.component'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../form-generator/form-generator-info-box/form-generator-info-box.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { FeatureFlagService } from '../../services/feature-flag.service'
import { PolicyService } from '../../services/policy.service'
import { PipelineService } from '../../services/pipeline.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-build',
  templateUrl: './setup-build.component.html',
  styleUrl: './setup-build.component.css',
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
export class SetupComponent implements OnInit, OnDestroy {
  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private luigiClient: LuigiClient,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubService: GithubService,
    private readonly jenkinsService: JenkinsService,
    private readonly pipelineService: PipelineService,
    private readonly piperService: PiperService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly policyService: PolicyService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
  }

  private contextSubscription: Subscription

  watch$: Observable<Pipeline>

  defaultOrchestrator = Orchestrators.JENKINS

  ngOnInit(): void {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    this.contextSubscription = this.luigiService.contextObservable().subscribe(() => {
      const params: { orchestrator?: Orchestrators } = getNodeParams(true)
      if (params.orchestrator) {
        this.defaultOrchestrator = params.orchestrator
      }
    })
  }

  ngOnDestroy(): void {
    this.contextSubscription.unsubscribe()
  }

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent

  loading = false
  errorMessage = signal('')

  formCreated = false
  formValue: DynamicFormValue

  questions: DynamicFormItem[] = [
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
        const context = await this.luigiService.getContextAsync()
        const entityContext = context.entityContext as unknown as EntityContext
        const repoUrl = entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

        let languages: Record<string, number>
        try {
          languages = await this.githubService.getRepositoryLanguages(this.luigiClient, this.luigiService, repoUrl)
        } catch (error) {
          this.errorMessage.set((error as Error).message)
        }

        if (!languages) {
          return BuildTool.Docker
        }

        const languagesMap = new Map()
        for (const [key, value] of Object.entries(languages)) {
          languagesMap.set(key, value)
        }
        const sortedLanguages = new Map([...languagesMap].sort((a, b) => b[1] - a[1]))

        if (sortedLanguages.has(Languages.DOCKERFILE)) {
          return BuildTool.Docker
        }

        for (const [key] of sortedLanguages) {
          switch (key) {
            case Languages.JAVA:
              return BuildTool.Maven
            case Languages.GO:
              return BuildTool.Golang
            case Languages.TYPESCRIPT:
            case Languages.JAVASCRIPT:
              return BuildTool.Npm
            case Languages.PYTHON:
              return BuildTool.Python
          }
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
      choices: async () => {
        const context = await this.luigiService.getContextAsync()
        const orchestrators = [Orchestrators.JENKINS]

        if (await this.featureFlagService.isGithubActionsEnabled(context.projectId)) {
          orchestrators.push(Orchestrators.GITHUB_ACTIONS_WORKFLOW)
        }

        return orchestrators
      },
      default: () => {
        return this.defaultOrchestrator
      },
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
          subheader: () =>
            Promise.resolve(`Don't have an instance yet?
            <a href="https://jenx.int.sap.eu2.hana.ondemand.com/#/imageOverview" target="_blank" rel="noopener noreferrer">Request one.</a>`),
        },
      },
      when: (formValue: SetupBuildFormValue) => {
        return formValue.orchestrator === Orchestrators.JENKINS
      },
    },
    {
      type: 'input',
      name: 'jenkinsUrl',
      message: 'Jenkins URL',
      placeholder: 'Enter URL',
      validate: (value: string) => {
        // validate if the provided URL is a valid one
        const urlValidation =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
        const regex = new RegExp(urlValidation)
        return regex.test(value) ? null : 'Please provide a valid URL'
      },
      validators: [Validators.required],
      when: (formValue: SetupBuildFormValue) => {
        return formValue.orchestrator === Orchestrators.JENKINS
      },
    },
    {
      type: 'header',
      name: 'jenkinsCredentialHeader',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'Jenkins credentials',
          subheader: (): Promise<string> => {
            return new Promise(
              () => `Your credentials are stored in Vault and needed to create a pipeline
            in your Jenkins instance. Technical user is preferred, you can find out how
            to set up one in the <a href="https://pages.github.tools.sap/hyperspace/jaas-documentation/faqs_and_troubleshooting/faq/#how-can-i-get-a-service-user" target="_blank" rel="noopener noreferrer">JaaS documentation.</a>`,
            )
          },
        },
      },
      when: (formValue: SetupBuildFormValue) => {
        return formValue.orchestrator === Orchestrators.JENKINS
      },
    },
    {
      type: 'radio',
      name: 'jenkinsCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => value.path.includes('jenkins'))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async (formValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => value.path.includes('jenkins'))
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'input',
      name: 'jenkinsUserId',
      message: 'User ID',
      placeholder: 'Enter ID',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator != Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      validators: [Validators.required],
    },
    {
      type: 'password',
      controlType: 'password',
      name: 'jenkinsToken',
      message: 'Token with overall (administer) permissions.',
      placeholder: 'Enter Token',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      validators: [Validators.required],
    },
    {
      type: 'message-strip',
      name: 'jenkinsVaultMaintainerErrorStrip',
      message: '',
      validate: () => "Can't finish the setup without Jenkins Credentials",
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
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
      name: 'jenkinsSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.path?.includes('jenkins'))?.[0]?.path ?? null
      },
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => value.path.includes('jenkins')).map((value) => value.path)
      },
      validators: [Validators.required],
      when: (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        return formValue.jenkinsCredentialType === CredentialTypes.EXISTING
      },
    },
    {
      type: 'header',
      name: 'githubHeaderJenkins',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'GitHub credentials',
          subheader: async () => {
            const { githubRepoUrl, githubOrgName, githubRepoName } = await this.githubService.getGithubMetadata()
            return `Needed to configure your pipeline in the <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">${githubOrgName}/${githubRepoName}</a> repository.`
          },
        },
      },
      when: (formValue) => formValue.orchestrator === Orchestrators.JENKINS,
    },
    {
      type: 'header',
      name: 'githubHeaderGithubActions',
      message: '',
      guiOptions: {
        additionalData: {
          header: 'GitHub credentials',
          subheader: async () => {
            const { githubRepoUrl, githubOrgName, githubRepoName } = await this.githubService.getGithubMetadata()
            return `To set up and manage your CI/CD services, it is necessary for us to have access to the GitHub organization that the <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">${githubOrgName}/${githubRepoName}</a> GitHub repository belongs to.`
          },
        },
      },
      when: (formValue) => formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW,
    },
    ...this.githubService.GITHUB_CREDENTIAL_FORM,
  ]

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(buildFormValue: SetupBuildFormValue): Promise<void> {
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext

    // create resources - because of dependencies the order needs to be: github - jenkins - piper
    const repoUrl = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login = entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''
    if (!repoUrl || !login || !repoName) {
      this.errorMessage.set(
        'Could not get GitHub metadata from Luigi context 🙄. Please reload the page and try again.',
      )
      this.loading = false
      return
    }
    const githubRepoUrl = new URL(repoUrl)

    this.formValue = buildFormValue
    this.loading = true

    try {
      // credentials
      let jenkinsPath: string

      // jenkins
      if (
        buildFormValue.jenkinsCredentialType === CredentialTypes.NEW &&
        buildFormValue.orchestrator === Orchestrators.JENKINS
      ) {
        const secretData: SecretData[] = [
          { key: 'token', value: buildFormValue.jenkinsToken },
          { key: 'url', value: buildFormValue.jenkinsUrl },
          { key: 'userId', value: buildFormValue.jenkinsUserId },
        ]
        const jenkinsUrl = new URL(buildFormValue.jenkinsUrl)
        // replace the dots in the hostname with dashes to avoid issues with vault path
        jenkinsPath = await this.secretService.storeCredential(
          `jenkins-${jenkinsUrl.hostname.replace(/\./g, '-')}`,
          secretData,
          buildFormValue.jenkinsUserId,
        )
      } else if (buildFormValue.jenkinsCredentialType === CredentialTypes.EXISTING) {
        jenkinsPath = this.secretService.getCredentialPath(buildFormValue.jenkinsSelectCredential, context.componentId)
      }
      const githubSecretPath = await this.githubService.storeGithubCredentials(buildFormValue, githubRepoUrl)

      if (!repoUrl || !login || !repoName) {
        throw new Error('Could not get GitHub repository details from frame context')
      }

      const labels = (await firstValueFrom(this.watch$)).labels

      const url = new URL(repoUrl)

      let isGithubActions = false
      if (buildFormValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
        isGithubActions = true
      }

      const repositoryResource = await firstValueFrom(
        this.githubService.createGithubRepository(url.origin, login, repoName, githubSecretPath, isGithubActions),
      )

      if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        await firstValueFrom(
          this.jenkinsService.createJenkinsPipeline(buildFormValue.jenkinsUrl, jenkinsPath, repositoryResource, labels),
        )
      }

      await firstValueFrom(
        this.piperService.createPiperConfig(
          githubSecretPath,
          repositoryResource,
          buildFormValue.buildTool,
          false,
          buildFormValue.buildTool === BuildTool.Docker ||
            buildFormValue.buildTool === BuildTool.Golang ||
            buildFormValue.buildTool === BuildTool.Gradle
            ? context.componentId
            : '',
          labels,
        ),
      )

      this.loading = false
      this.luigiClient.uxManager().closeCurrentModal()
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage) {
        this.errorMessage.set(errorMessage)
      } else {
        this.errorMessage.set('Unknown error')
      }
      this.loading = false
    }
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
