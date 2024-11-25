import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core'
import { Validators } from '@angular/forms'
import { FormModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform'
import { DynamicFormItem, FormGeneratorComponent, FormGeneratorService } from '@fundamental-ngx/platform/form'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { CredentialTypes, GithubInstances, Orchestrators } from '@enums'
import { Pipeline, ValidationLanguage } from '@types'
import { SecretData, SecretService } from '../../services/secret.service'
import { debounceTime, firstValueFrom, lastValueFrom, Subscription, Observable } from 'rxjs'
import { GithubService } from '../../services/github.service'
import { JenkinsService } from '../../services/jenkins.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { PlatformMessagePopoverModule } from '@fundamental-ngx/platform/message-popover'
import { PiperService } from '../../services/piper.service'
import { BuildTool } from '@generated/graphql'
import { getNodeParams } from '@luigi-project/client'
import { FeatureFlagService } from '../../services/feature-flag.service'
import { PolicyService } from '../../services/policy.service'
import { PipelineService } from '../../services/pipeline.service'
import { ValidationLanguages } from '@constants'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../form-generator/form-generator-header/form-generator-header.component'
import {
  FormGeneratorInfoBoxAdditionalData,
  PlatformFormGeneratorCustomInfoBoxComponent,
} from '../form-generator/form-generator-info-box/form-generator-info-box.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../form-generator/form-generator-message-strip/form-generator-message-strip.component'
import {
  FormGeneratorButtonAdditionalData,
  PlatformFormGeneratorCustomButtonComponent,
} from '../form-generator/form-generator-button/form-generator-button.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../form-generator/form-generator-validator/form-generator-validator.component'
import {
  FormGeneratorObjectStatusAdditionalData,
  PlatformFormGeneratorCustomObjectStatusComponent,
} from '../form-generator/form-generator-object-status/form-generator-object-status.component'
import { GithubActionsService } from '../../services/github-actions.service'
import { DebugModeService } from '../../services/debug-mode.service'

// All the form fields excluding headers, message-strips, and validators
type SetupBuildFormValue = {
  buildTool?: BuildTool
  orchestrator?: Orchestrators

  jenkinsUrl?: string
  jenkinsCredentialType?: CredentialTypes
  jenkinsUserId?: string
  jenkinsToken?: string
  jenkinsSelectCredential?: string
  jenkinsGithubCredentialType?: CredentialTypes
  jenkinsGithubToken?: string
  jenkinsGithubSelectCredential?: string

  githubCredentialType?: CredentialTypes
  githubToken?: string
  githubSelectCredential?: string
}

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
    private luigiClient: LuigiClient,
    private readonly luigiService: DxpLuigiContextService,
    private readonly debugModeService: DebugModeService,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubService: GithubService,
    private readonly githubActionsService: GithubActionsService,
    private readonly jenkinsService: JenkinsService,
    private readonly pipelineService: PipelineService,
    private readonly piperService: PiperService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly policyService: PolicyService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomButtonComponent, ['button'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomObjectStatusComponent, ['object-status'])
  }

  private contextSubscription: Subscription

  watch$: Observable<Pipeline>

  defaultOrchestrator = Orchestrators.JENKINS

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent

  loading = false
  errorMessage = signal('')

  formCreated = false

  showGithubAppInstallation = false
  isGithubAppInstalled = false
  hasGithubAppInstallButtonBeenClicked = false
  isGithubAppInstallationFinished = false
  githubAppInstallationError = ''

  githubSugarAppFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'githubAppHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'Install runners app',
          ignoreBottomMargin: true,
          subheader: () => Promise.resolve(`Install the SUGAR app to add runners to your GitHub Actions workflows`),
          subheaderStyle: {
            color: '#000000',
            'font-size': '14px',
          },
        },
      },
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled,
    },
    {
      type: 'validator',
      name: 'githubAppRequiredValidator',
      message: 'SUGAR app',
      validate: () => Promise.resolve("Can't finish the setup without SUGAR app"),
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled &&
        !this.isGithubAppInstallationFinished,
    },
    {
      type: 'button',
      name: 'githubAppInstallButton',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorButtonAdditionalData>{
          type: 'emphasized',
          label: 'Install App',
          glyph: 'action',
          action: async () => {
            const githubAppInstallationToolsLinks = {
              live: 'https://github.tools.sap/github-apps/sugar/installations/select_target',
              int: 'https://github.tools.sap/github-apps/sugar-dev/installations/select_target',
              dev: 'https://github.tools.sap/github-apps/sugar-dev/installations/select_target',
            }
            const githubAppInstallationWdfLinks = {
              live: 'https://github.wdf.sap.corp/github-apps/sugar/installations/select_target',
              int: 'https://github.wdf.sap.corp/github-apps/sugar-dev/installations/select_target',
              dev: 'https://github.wdf.sap.corp/github-apps/sugar-dev/installations/select_target',
            }

            const githubMetadata = await this.githubService.getGithubMetadata()
            const tier = this.debugModeService.getTier()

            let githubAppInstallationLink = githubAppInstallationToolsLinks[tier]
            if (githubMetadata.githubHostName === GithubInstances.WDF.toString()) {
              githubAppInstallationLink = githubAppInstallationWdfLinks[tier]
            }

            window.open(githubAppInstallationLink, '_blank', 'noopener, noreferrer')

            if (this.hasGithubAppInstallButtonBeenClicked) {
              // app reinstall
              this.isGithubAppInstalled = false
              this.isGithubAppInstallationFinished = false
              this.githubAppInstallationError = ''
            }
            this.hasGithubAppInstallButtonBeenClicked = true

            // steps visibility update isn't triggered on component-level variable change,
            // have to trigger it manually
            // P.S: signal also doesn't help
            await this.formGenerator.refreshStepsVisibility()
          },
        },
      },
      when: (formValue: SetupBuildFormValue) => {
        const isInstallationFailed = this.isGithubAppInstallationFinished && !!this.githubAppInstallationError
        return (
          this.showGithubAppInstallation &&
          formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
          !this.isGithubAppInstalled &&
          (!this.hasGithubAppInstallButtonBeenClicked || isInstallationFailed)
        )
      },
    },
    {
      type: 'button',
      name: 'githubAppInstallationCheckButton',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorButtonAdditionalData>{
          type: 'emphasized',
          label: 'Check Installation',
          action: async () => {
            const githubMetadata = await this.githubService.getGithubMetadata()

            try {
              const isSolinasAppInstalled = await firstValueFrom(
                this.githubActionsService.getGithubActionSolinasVerification(
                  githubMetadata.githubOrgName,
                  githubMetadata.githubRepoUrl,
                ),
              )

              if (!isSolinasAppInstalled) {
                this.githubAppInstallationError = "That didn't work. Try re-installing the app."
              }
            } catch (error) {
              this.githubAppInstallationError = "That didn't work. Try re-installing the app."
            } finally {
              this.isGithubAppInstallationFinished = true

              // steps visibility update isn't triggered on component-level variable change,
              // have to trigger it manually
              // P.S: signal also doesn't help
              await this.formGenerator.refreshStepsVisibility()
            }
          },
          glyph: 'refresh',
        },
      },
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled &&
        this.hasGithubAppInstallButtonBeenClicked &&
        !this.isGithubAppInstallationFinished,
    },
    {
      type: 'message-strip',
      name: 'githubAppInstallationErrorStrip',
      message: '',
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled &&
        this.isGithubAppInstallationFinished &&
        !!this.githubAppInstallationError,
      guiOptions: {
        additionalData: <FormGeneratorMessageStripAdditionalData>{
          type: 'error',
          message: () => Promise.resolve(this.githubAppInstallationError),
        },
      },
    },
    {
      type: 'validator',
      name: 'githubAppInstallationErrorStripValidator',
      message: 'SUGAR app',
      validate: () => Promise.resolve(this.githubAppInstallationError),
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled &&
        this.isGithubAppInstallationFinished &&
        !!this.githubAppInstallationError,
    },
    {
      type: 'object-status',
      name: 'githubAppInstallationSuccess',
      message: '',
      when: (formValue: SetupBuildFormValue) =>
        this.showGithubAppInstallation &&
        formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW &&
        !this.isGithubAppInstalled &&
        this.isGithubAppInstallationFinished &&
        !this.githubAppInstallationError,
      guiOptions: {
        additionalData: <FormGeneratorObjectStatusAdditionalData>{
          status: 'positive',
          label: 'Installed',
          glyph: 'sys-enter-2',
          inverted: true,
        },
      },
    },
  ]

  githubPatFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'githubCredentialsHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'GitHub credentials',
          subheader: async () => {
            const { githubRepoUrl, githubOrgName, githubRepoName } = await this.githubService.getGithubMetadata()
            return `Needed to configure your pipeline in the <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">${githubOrgName}/${githubRepoName}</a> repository.`
          },
        },
      },
      when: (formValue) =>
        !this.showGithubAppInstallation && formValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW,
    },
    {
      type: 'radio',
      name: 'githubCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => this.githubService.isValidGithubSecret(value))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => this.githubService.isValidGithubSecret(value))
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
      when: async (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      validate: async (value: string) => await this.githubService.validatePatInForm(value),
    },
    {
      type: 'info',
      name: 'githubPatInfoBox',
      message: '',
      when: async (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      guiOptions: {
        additionalData: <FormGeneratorInfoBoxAdditionalData>{
          header: 'Instructions',
          instructions: async () => await this.githubService.getFormPatInstructions(),
        },
      },
    },
    {
      type: 'message-strip',
      name: 'githubVaultMaintainerErrorStrip',
      message: '',
      when: async (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && !canUserEditCredentials
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
      name: 'githubVaultMaintainerErrorStripValidator',
      message: 'Github Credentials',
      when: async (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.githubCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      validate: () => "Can't finish the setup without Github Credentials",
    },
    {
      type: 'list',
      name: 'githubSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => await this.githubService.getFormDefaultCredentialPath(),
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => this.githubService.isValidGithubSecret(value)).map((value) => value.path)
      },
      validators: [Validators.required],
      when: (formValue: SetupBuildFormValue) => {
        if (this.showGithubAppInstallation || formValue.orchestrator !== Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
          return false
        }

        return formValue.githubCredentialType === CredentialTypes.EXISTING
      },
    },
  ]

  jenkinsFormItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'jenkinsInstanceHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'Jenkins instance',
          subheader: () =>
            Promise.resolve(
              `Don't have an instance yet? Create an account in the Jenkins as a Service extension to get one.`,
            ),
        },
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
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'Jenkins credentials',
          subheader: (): Promise<string> => {
            return new Promise(
              () => `Your credentials are stored in Vault and needed to create a pipeline
            in your Jenkins instance. Technical user is preferred, you can find out how
            to set up one in the <a href="https://pages.github.tools.sap/hyperspace/jaas-documentation/faqs_and_troubleshooting/faq/#how-can-i-get-a-service-user" target="_blank" rel="noopener noreferrer">JaaS documentation.</a>`,
            )
          },
          ignoreBottomMargin: true,
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
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      guiOptions: {
        additionalData: <FormGeneratorMessageStripAdditionalData>{
          type: 'error',
          message: this.policyService.getCantAddCredentialsErrorMessage,
        },
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
    {
      type: 'header',
      name: 'jenkinsGithubCredentialsHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'GitHub credentials',
          subheader: async () => {
            const { githubRepoUrl, githubOrgName, githubRepoName } = await this.githubService.getGithubMetadata()
            return `Needed to configure your pipeline in the <a href="${githubRepoUrl}" target="_blank" rel="noopener noreferrer">${githubOrgName}/${githubRepoName}</a> repository.`
          },
        },
      },
      when: (formValue: SetupBuildFormValue) => formValue.orchestrator === Orchestrators.JENKINS,
    },
    {
      type: 'radio',
      name: 'jenkinsGithubCredentialType',
      message: '',
      default: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        if (secrets.some((value) => this.githubService.isValidGithubSecret(value))) {
          return CredentialTypes.EXISTING
        }
        return CredentialTypes.NEW
      },
      choices: [CredentialTypes.EXISTING, CredentialTypes.NEW],
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.some((value) => this.githubService.isValidGithubSecret(value))
      },
      guiOptions: {
        inline: true,
      },
      validators: [Validators.required],
    },
    {
      type: 'password',
      controlType: 'password',
      name: 'jenkinsGithubToken',
      message: 'Personal Access Token (PAT)',
      placeholder: 'Enter service user or personal user access token',
      validators: [Validators.required],
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsGithubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      validate: async (value: string) => await this.githubService.validatePatInForm(value),
    },
    {
      type: 'info',
      name: 'jenkinsGithubPatInfoBox',
      message: '',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsGithubCredentialType === CredentialTypes.NEW && canUserEditCredentials
      },
      guiOptions: {
        additionalData: <FormGeneratorInfoBoxAdditionalData>{
          header: 'Instructions',
          instructions: async () => await this.githubService.getFormPatInstructions(),
        },
      },
    },
    {
      type: 'message-strip',
      name: 'jenkinsGithubVaultMaintainerErrorStrip',
      message: '',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsGithubCredentialType === CredentialTypes.NEW && !canUserEditCredentials
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
      name: 'jenkinsGithubVaultMaintainerErrorStripValidator',
      message: 'Github Credentials',
      when: async (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }

        const canUserEditCredentials = await this.policyService.canUserEditCredentials()
        return formValue.jenkinsGithubCredentialType === CredentialTypes.NEW && !canUserEditCredentials
      },
      validate: () => "Can't finish the setup without Github Credentials",
    },
    {
      type: 'list',
      name: 'jenkinsGithubSelectCredential',
      message: 'Credential',
      placeholder: 'Select Credential',
      default: async () => await this.githubService.getFormDefaultCredentialPath(),
      choices: async () => {
        const secrets = await lastValueFrom(this.secretService.getPipelineSecrets())
        return secrets.filter((value) => this.githubService.isValidGithubSecret(value)).map((value) => value.path)
      },
      validators: [Validators.required],
      when: (formValue: SetupBuildFormValue) => {
        if (formValue.orchestrator !== Orchestrators.JENKINS) {
          return false
        }

        return formValue.jenkinsGithubCredentialType === CredentialTypes.EXISTING
      },
    },
  ]

  formItems: DynamicFormItem[] = [
    {
      type: 'header',
      name: 'buildToolHeader',
      message: '',
      guiOptions: {
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'Select your build tool',
          ignoreTopMargin: true,
          ignoreBottomMargin: true,
        },
      },
    },
    {
      type: 'select',
      name: 'buildTool',
      message: '',
      default: async () => {
        let languages: { Name: string; Bytes: number }[]
        let mostUsedLanguage: ValidationLanguage
        try {
          languages = await firstValueFrom(this.githubService.getRepositoryLanguages())
          mostUsedLanguage = this.githubService.getMostUsedLanguage(languages, ValidationLanguages)
        } catch (error) {
          this.errorMessage.set((error as Error).message)
        }

        if (!languages || !mostUsedLanguage || !mostUsedLanguage.displayName) {
          return BuildTool.Docker
        }
        switch (mostUsedLanguage.displayName) {
          case 'Java':
            return BuildTool.Maven
          case 'Golang':
            return BuildTool.Golang
          case 'Javascript/Typescript':
            return BuildTool.Npm
          case 'Python':
            return BuildTool.Python
          case 'Other':
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
        additionalData: <FormGeneratorHeaderAdditionalData>{
          header: 'Select an orchestrator',
          buttonText: 'Decision Help',
          buttonAction: () =>
            window.open(
              'https://pages.github.tools.sap/hyperspace/academy/tools/decisionhelp/Orchestrators/',
              '_blank',
              'noopener, noreferrer',
            ),
          ignoreBottomMargin: true,
        },
      },
    },
    {
      type: 'radio',
      name: 'orchestrator',
      message: '',
      choices: async () => {
        const context = await this.luigiService.getContextAsync()
        const orchestrators: Array<Orchestrators> = []

        if (await this.featureFlagService.isGithubActionsEnabled(context.projectId)) {
          orchestrators.push(Orchestrators.GITHUB_ACTIONS_WORKFLOW)
        }

        orchestrators.push(Orchestrators.JENKINS)

        return orchestrators
      },
      default: () => {
        return this.defaultOrchestrator
      },
      validators: [Validators.required],
    },
    ...this.githubSugarAppFormItems,
    ...this.githubPatFormItems,
    ...this.jenkinsFormItems,
  ]

  onFormCreated(): void {
    this.formCreated = true
  }

  async ngOnInit(): Promise<void> {
    const context = await this.luigiService.getContextAsync()

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    this.contextSubscription = this.luigiService.contextObservable().subscribe(() => {
      const params: { orchestrator?: Orchestrators } = getNodeParams(true)
      if (params.orchestrator) {
        this.defaultOrchestrator = params.orchestrator
      }
    })

    this.showGithubAppInstallation = await this.featureFlagService.isSugarRegistrationEnabled(context.projectId)

    if (!this.showGithubAppInstallation) {
      return
    }

    const githubMetadata = await this.githubService.getGithubMetadata()
    try {
      const isSolinasAppIntalled = await firstValueFrom(
        this.githubActionsService.getGithubActionSolinasVerification(
          githubMetadata.githubOrgName,
          githubMetadata.githubRepoUrl,
        ),
      )

      if (isSolinasAppIntalled) {
        this.isGithubAppInstalled = true
      }
    } catch (error) {
      this.isGithubAppInstallationFinished = true
      this.githubAppInstallationError = "That didn't work. Try re-installing the app."
    }
  }

  ngOnDestroy(): void {
    this.contextSubscription.unsubscribe()
  }

  async onFormSubmitted(buildFormValue: SetupBuildFormValue): Promise<void> {
    if (this.showGithubAppInstallation) {
      return await this.onGithubAppFormSubmit(buildFormValue)
    }

    return await this.onGithubPatFormSubmit(buildFormValue)
  }

  // TODO: remove this function with sugar app feature-flag removal
  async onGithubPatFormSubmit(buildFormValue: SetupBuildFormValue): Promise<void> {
    this.loading = true

    const context = await this.luigiService.getContextAsync()
    const labels = (await firstValueFrom(this.watch$)).labels

    try {
      const githubMetadata = await this.githubService.getGithubMetadata()
      if (!githubMetadata.githubRepoUrl || !githubMetadata.githubOrgName || !githubMetadata.githubRepoName) {
        throw new Error('Could not get GitHub metadata from Luigi context 🙄. Please reload the page and try again.')
      }
      const githubRepoUrl = new URL(githubMetadata.githubRepoUrl)

      let githubCredentialType = buildFormValue.githubCredentialType
      let githubSelectCredential = buildFormValue.githubSelectCredential
      let githubToken = buildFormValue.githubToken
      if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        githubCredentialType = buildFormValue.jenkinsGithubCredentialType
        githubSelectCredential = buildFormValue.jenkinsGithubSelectCredential
        githubToken = buildFormValue.jenkinsGithubToken
      }

      // Github credentials
      const githubSecretPath = await this.githubService.storeGithubCredentials(
        {
          githubCredentialType,
          githubSelectCredential,
          githubToken,
        },
        githubRepoUrl,
      )

      // Github repository and Github Actions
      let isGithubActions = false
      if (buildFormValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
        isGithubActions = true
      }

      const repositoryResource = await firstValueFrom(
        this.githubService.createGithubRepository(
          githubRepoUrl.origin,
          githubMetadata.githubOrgName,
          githubMetadata.githubRepoName,
          githubSecretPath,
          isGithubActions,
        ),
      )

      // Jenkins
      if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        // Jenkins credential
        let jenkinsCredentialPath: string

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
            repositoryResource,
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
          repositoryResource,
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
      this.loading = false
    }
  }

  // TODO: rename this function to onFormSubmitted() with sugar app feature-flag removal
  async onGithubAppFormSubmit(buildFormValue: SetupBuildFormValue): Promise<void> {
    this.loading = true

    const context = await this.luigiService.getContextAsync()
    const labels = (await firstValueFrom(this.watch$)).labels

    try {
      const githubMetadata = await this.githubService.getGithubMetadata()
      if (!githubMetadata.githubRepoUrl || !githubMetadata.githubOrgName || !githubMetadata.githubRepoName) {
        throw new Error('Could not get GitHub metadata from Luigi context 🙄. Please reload the page and try again.')
      }
      const githubRepoUrl = new URL(githubMetadata.githubRepoUrl)

      // Github repository and Github Actions
      let isGithubActions = false
      if (buildFormValue.orchestrator === Orchestrators.GITHUB_ACTIONS_WORKFLOW) {
        isGithubActions = true
      }

      const repositoryResource = await firstValueFrom(
        this.githubService.createGithubRepository(
          githubRepoUrl.origin,
          githubMetadata.githubOrgName,
          githubMetadata.githubRepoName,
          undefined,
          isGithubActions,
        ),
      )

      let githubSecretPath = ''
      // Jenkins
      if (buildFormValue.orchestrator === Orchestrators.JENKINS) {
        // Github credentials
        githubSecretPath = await this.githubService.storeGithubCredentials(
          {
            githubCredentialType: buildFormValue.jenkinsGithubCredentialType,
            githubSelectCredential: buildFormValue.jenkinsGithubSelectCredential,
            githubToken: buildFormValue.jenkinsGithubToken,
          },
          githubRepoUrl,
        )

        // Jenkins credential
        let jenkinsCredentialPath: string

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
            repositoryResource,
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
          repositoryResource,
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
