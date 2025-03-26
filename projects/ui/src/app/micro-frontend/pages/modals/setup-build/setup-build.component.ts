import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { Validators } from '@angular/forms'
import { ProgrammingLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { CredentialTypes, Languages, Orchestrators } from '@enums'
import { FormModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { DynamicFormItem, FormGeneratorComponent, FormGeneratorService } from '@fundamental-ngx/platform/form'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { BuildTool } from '@generated/graphql'
import { getNodeParams } from '@luigi-project/client'
import { Pipeline, ProgrammingLanguage } from '@types'
import { debounceTime, firstValueFrom, lastValueFrom, Observable, Subscription } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { GithubActionsFormService } from '../../../services/forms/github-actions-form.service'
import {
  GithubCredentialFormService,
  GithubCredentialFormValueP,
} from '../../../services/forms/github-credential-form.service'
import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubService } from '../../../services/github.service'
import { JenkinsService } from '../../../services/jenkins.service'
import { PipelineService } from '../../../services/pipeline.service'
import { PiperService } from '../../../services/piper.service'
import { PolicyService } from '../../../services/policy.service'
import { SecretData, SecretService } from '../../../services/secret.service'

// All the form fields excluding headers, message-strips, and validators
type SetupBuildFormValue = {
  buildTool?: BuildTool
  orchestrator?: Orchestrators

  jenkinsUrl?: string
  jenkinsCredentialType?: CredentialTypes
  jenkinsUserId?: string
  jenkinsToken?: string
  jenkinsSelectCredential?: string
} & JenkinsGithubCredentialFormValue

type JenkinsGithubCredentialFormPrefix = 'jenkinsGithub'
type JenkinsGithubCredentialFormValue = GithubCredentialFormValueP<JenkinsGithubCredentialFormPrefix>

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-build',
  templateUrl: './setup-build.component.html',
  styleUrl: './setup-build.component.css',
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    FormModule,
    FundamentalNgxPlatformModule,
    ErrorMessageComponent,
    PlatformMessagePopoverModule,
  ],
})
export class SetupBuildComponent implements OnInit, OnDestroy {
  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
    private readonly formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubService: GithubService,
    private readonly githubActionsService: GithubActionsService,
    private readonly jenkinsService: JenkinsService,
    private readonly pipelineService: PipelineService,
    private readonly piperService: PiperService,
    private readonly policyService: PolicyService,
    private readonly githubCredentialFormService: GithubCredentialFormService,
    private readonly githubActionsFormService: GithubActionsFormService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  private contextSubscription: Subscription

  watch$: Observable<Pipeline>

  defaultOrchestrator = Orchestrators.GITHUB_ACTIONS_PIPELINE

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent

  loading = signal(true)
  errorMessage = signal('')

  formCreated = false

  jenkinsFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'jenkinsInstanceHeader',
      message: '',
      guiOptions: {
        additionalData: {
          headerText: 'Jenkins instance',
          subheaderHtml: () =>
            Promise.resolve(
              `Don't have an instance yet? Create an account in the Jenkins as a Service extension to get one.`,
            ),
          ignoreTopMargin: true,
        } as FormGeneratorHeaderAdditionalData,
      },
      when: (formValue: SetupBuildFormValue) => formValue.orchestrator === Orchestrators.JENKINS,
    },
    {
      type: 'input',
      name: 'jenkinsUrl',
      message: 'Jenkins URL',
      placeholder: 'Enter URL',
      validate: (value: string) => {
        // validate if the provided URL is a valid one
        const urlValidation =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi
        const regex = new RegExp(urlValidation)
        return regex.test(value) ? null : 'Please provide a valid URL'
      },
      validators: [Validators.required],
      when: (formValue: SetupBuildFormValue) => {
        return formValue.orchestrator === Orchestrators.JENKINS
      },
    },
    {
      type: 'message-strip',
      name: 'jenkinsPiperLibCredentialsWarningStrip',
      message: '',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const githubMetadata = await this.githubService.getGithubMetadata()
        if (githubMetadata.githubInstance === 'https://github.wdf.sap.corp') {
          return false
        }
        return await this.policyService.canUserEditCredentials()
      },
      guiOptions: {
        additionalData: {
          type: 'information',
          message: this.policyService.getPiperLibCredentialsMessage,
        } as FormGeneratorMessageStripAdditionalData,
      },
    },
    {
      type: 'header',
      name: 'jenkinsCredentialHeader',
      message: '',
      guiOptions: {
        additionalData: {
          headerText: 'Jenkins credentials',
          subheaderHtml: () =>
            Promise.resolve(
              `Your credentials are stored in Vault and needed to create a pipeline
            in your Jenkins instance. Technical user is preferred, you can find out how
            to set up one in the <a href="https://pages.github.tools.sap/hyperspace/jaas-documentation/faqs_and_troubleshooting/faq/#how-can-i-get-a-service-user" target="_blank" rel="noopener noreferrer">JaaS documentation.</a>`,
            ),
          ignoreBottomMargin: true,
        } as FormGeneratorHeaderAdditionalData,
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
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      guiOptions: {
        additionalData: {
          type: 'error',
          message: this.policyService.getCantAddCredentialsErrorMessage,
        } as FormGeneratorMessageStripAdditionalData,
      },
    },
    {
      type: 'validator',
      name: 'jenkinsVaultMaintainerErrorStripValidator',
      message: 'Jenkins Credentials',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      validate: () => "Can't finish the setup without Jenkins Credentials",
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
  ]

  formItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'buildToolHeader',
      message: '',
      guiOptions: {
        additionalData: {
          headerText: 'Select your build tool',
          ignoreTopMargin: true,
          ignoreBottomMargin: true,
        } as FormGeneratorHeaderAdditionalData,
      },
    },
    {
      type: 'select',
      name: 'buildTool',
      message: '',
      default: async () => {
        let languages: { Name: string; Bytes: number }[]
        let mostUsedLanguage: ProgrammingLanguage
        try {
          // Languages returned from GitHub are based on the Linguist library, full list see: https://github.com/github-linguist/linguist/tree/main/samples
          languages = (await firstValueFrom(this.githubService.getComponentExtensions())).languages?.Languages
          mostUsedLanguage = this.githubService.getMostUsedLanguage(languages, ProgrammingLanguages)
        } catch (error) {
          this.errorMessage.set((error as Error).message)
        }

        if (!languages || !mostUsedLanguage || !mostUsedLanguage.displayName) {
          return BuildTool.Docker
        }
        switch (mostUsedLanguage.id) {
          case Languages.JAVA:
            return BuildTool.Maven
          case Languages.GO:
            return BuildTool.Golang
          case Languages.JAVASCRIPT:
            return BuildTool.Npm
          case Languages.PYTHON:
            return BuildTool.Python
          default:
            return BuildTool.Docker
        }
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
          headerText: 'Select an orchestrator',
          buttonText: 'Decision Help',
          buttonAction: () =>
            window.open(
              'https://pages.github.tools.sap/hyperspace/academy/tools/decisionhelp/Orchestrators/',
              '_blank',
              'noopener, noreferrer',
            ),
          ignoreBottomMargin: true,
        } as FormGeneratorHeaderAdditionalData,
      },
    },
    {
      type: 'radio',
      name: 'orchestrator',
      message: '',
      choices: async () => {
        return [Orchestrators.GITHUB_ACTIONS_PIPELINE, Orchestrators.JENKINS]
      },
      default: () => {
        return this.defaultOrchestrator
      },
      validators: [Validators.required],
    },
    {
      type: 'header',
      name: 'orchestratorSpacer',
      message: '',
      guiOptions: {
        additionalData: {
          headerText: '',
          ignoreTopMargin: true,
          ignoreBottomMargin: true,
        } as FormGeneratorHeaderAdditionalData,
      },
    },
    ...this.jenkinsFormItems,
  ]

  async ngOnInit(): Promise<void> {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    this.contextSubscription = this.luigiService.contextObservable().subscribe(() => {
      const params: { orchestrator?: Orchestrators } = getNodeParams(true)
      if (params.orchestrator) {
        this.defaultOrchestrator = params.orchestrator
      }
    })

    const jenkinsGithubCredentialFormItems = this.githubCredentialFormService.buildFormItems<
      SetupBuildFormValue,
      JenkinsGithubCredentialFormPrefix
    >('jenkinsGithub', (formValue) => formValue.orchestrator === Orchestrators.JENKINS)
    const githubActionsFormItems = await this.githubActionsFormService.buildFormItems<SetupBuildFormValue>(
      this.refreshStepsVisibility.bind(this) as () => Promise<void>,
      (formValue) => formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_PIPELINE,
    )

    this.formItems = this.formItems.concat(jenkinsGithubCredentialFormItems, githubActionsFormItems)

    this.loading.set(false)
  }

  ngOnDestroy(): void {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe()
    }
  }

  onFormCreated(): void {
    this.formCreated = true
  }

  async refreshStepsVisibility() {
    await this.formGenerator.refreshStepsVisibility()
  }

  async onFormSubmitted(buildFormValue: SetupBuildFormValue): Promise<void> {
    this.loading.set(true)

    const context = await this.luigiService.getContextAsync()
    const labels = (await firstValueFrom(this.watch$)).labels

    try {
      const githubMetadata = await this.githubService.getGithubMetadata()
      if (!githubMetadata.githubRepoUrl || !githubMetadata.githubOrgName || !githubMetadata.githubRepoName) {
        throw new Error('Could not get GitHub metadata from Luigi context 🙄. Please reload the page and try again.')
      }
      const githubRepoUrl = new URL(githubMetadata.githubRepoUrl)

      let githubSecretPath: string | undefined = undefined
      if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        githubSecretPath = await this.githubService.storeGithubCredentials(
          {
            githubCredentialType: buildFormValue.jenkinsGithubCredentialType,
            githubSelectCredential: buildFormValue.jenkinsGithubSelectCredential,
            githubToken: buildFormValue.jenkinsGithubToken,
          },
          githubRepoUrl,
        )
      }

      // Github repository and Github Actions
      let isGithubActions = false
      if (buildFormValue.orchestrator === Orchestrators.GITHUB_ACTIONS_PIPELINE) {
        isGithubActions = true
      }

      const repositoryResourceName = await firstValueFrom(
        this.githubService.createGithubRepository(
          githubRepoUrl.origin,
          githubMetadata.githubOrgName,
          githubMetadata.githubRepoName,
          isGithubActions,
        ),
      )

      if (buildFormValue.orchestrator === Orchestrators.GITHUB_ACTIONS_PIPELINE) {
        await firstValueFrom(
          this.githubActionsService.createGithubActionsPipeline(
            githubMetadata.githubInstance,
            githubMetadata.githubOrgName,
          ),
        )
      } else if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        let jenkinsCredentialPath: string
        // Jenkins credential

        if (buildFormValue.jenkinsCredentialType === CredentialTypes.NEW) {
          const jenkinsUrl = new URL(buildFormValue.jenkinsUrl)
          const secretData: SecretData[] = [
            { key: 'token', value: buildFormValue.jenkinsToken },
            { key: 'url', value: jenkinsUrl.href },
            { key: 'userId', value: buildFormValue.jenkinsUserId },
          ]
          // replace the dots in the hostname with dashes to avoid issues with vault path
          jenkinsCredentialPath = await this.secretService.storeCredential(
            `jenkins-${jenkinsUrl.hostname.replace(/\./g, '-')}`,
            secretData,
            buildFormValue.jenkinsUserId,
          )
        } else {
          jenkinsCredentialPath = this.secretService.getCredentialPath(
            buildFormValue.jenkinsSelectCredential,
            context.componentId,
          )
        }

        // Jenkins pipeline
        await firstValueFrom(
          this.jenkinsService.createJenkinsPipeline(
            buildFormValue.jenkinsUrl.trim(),
            jenkinsCredentialPath,
            repositoryResourceName,
            githubSecretPath,
            labels,
          ),
        )
      }

      // Piper config
      let dockerImageName = ''
      if ([BuildTool.Docker, BuildTool.Golang, BuildTool.Gradle].includes(buildFormValue.buildTool)) {
        dockerImageName = context.componentId
      }

      await firstValueFrom(
        this.piperService.createPiperConfig(
          githubSecretPath,
          repositoryResourceName,
          buildFormValue.buildTool,
          false,
          dockerImageName,
          labels,
        ),
      )
      this.luigiClient.uxManager().closeCurrentModal()
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'Unknown error'
      this.errorMessage.set(errorMessage)
    } finally {
      this.loading.set(false)
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
