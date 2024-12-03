import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { GithubInstances } from '@enums'
import { DynamicFormItem, FormGeneratorService } from '@fundamental-ngx/platform'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { GithubService } from '../github.service'
import { GithubCredentialFormService, GithubCredentialFormValueP } from './github-credential-form.service'
import { FeatureFlagService } from '../feature-flag.service'
import {
  FormGeneratorHeaderAdditionalData,
  PlatformFormGeneratorCustomHeaderElementComponent,
} from '../../components/form-generator/form-generator-header/form-generator-header.component'
import {
  FormGeneratorButtonAdditionalData,
  PlatformFormGeneratorCustomButtonComponent,
} from '../../components/form-generator/form-generator-button/form-generator-button.component'
import { GithubActionsService } from '../github-actions.service'
import { DebugModeService } from '../debug-mode.service'
import {
  FormGeneratorObjectStatusAdditionalData,
  PlatformFormGeneratorCustomObjectStatusComponent,
} from '../../components/form-generator/form-generator-object-status/form-generator-object-status.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../components/form-generator/form-generator-validator/form-generator-validator.component'

export type GithubActionsFormValueP<P extends string = 'github'> = GithubCredentialFormValueP<P>

@Injectable({ providedIn: 'root' })
export class GithubActionsFormService {
  constructor(
    private readonly luigiService: DxpLuigiContextService,
    private readonly debugModeService: DebugModeService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly githubService: GithubService,
    private readonly githubActionsService: GithubActionsService,
    private readonly formGeneratorService: FormGeneratorService,
    private readonly githubCredentialFormSevice: GithubCredentialFormService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomButtonComponent, ['button'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomObjectStatusComponent, ['object-status'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  public async buildFormItems<T extends GithubActionsFormValueP<P>, P extends string = 'github'>(
    formItemNamePrefix: P = 'github' as P,
    showFormItems: (formValue: T) => boolean | Promise<boolean>,
    refreshStepsVisibility: () => Promise<void>,
  ): Promise<DynamicFormItem[]> {
    const context = await this.luigiService.getContextAsync()
    const isSugarRegistrationEnabled = await this.featureFlagService.isSugarRegistrationEnabled(context.projectId)

    const showPatFormItems = async (formValue: T): Promise<boolean> => {
      return !isSugarRegistrationEnabled && (await showFormItems(formValue))
    }

    const showAppFormItems = async (formValue: T): Promise<boolean> => {
      return isSugarRegistrationEnabled && (await showFormItems(formValue))
    }

    let isAppInstalled = false
    let hasAppInstallButtonBeenClicked = false
    let hasAppInstallationFinished = false
    let appInstallationError = ''

    if (isSugarRegistrationEnabled) {
      const githubMetadata = await this.githubService.getGithubMetadata()
      try {
        isAppInstalled = await firstValueFrom(
          this.githubActionsService.getGithubActionSolinasVerification(
            githubMetadata.githubOrgName,
            githubMetadata.githubRepoUrl,
          ),
        )
      } catch (error) {
        hasAppInstallationFinished = true
        appInstallationError = "That didn't work. Try re-installing the app."
      }
    }

    return [
      ...this.githubCredentialFormSevice.buildFormItems<T, P>(formItemNamePrefix, showPatFormItems),
      {
        type: 'header',
        name: `${formItemNamePrefix}AppHeader`,
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
        when: async (formValue: T) => (await showAppFormItems(formValue)) && !isAppInstalled,
      },
      {
        type: 'validator',
        name: `${formItemNamePrefix}AppRequiredValidator`,
        message: 'SUGAR app',
        validate: () => Promise.resolve("Can't finish the setup without SUGAR app"),
        when: async (formValue: T) =>
          (await showAppFormItems(formValue)) && !isAppInstalled && !hasAppInstallationFinished,
      },
      {
        type: 'button',
        name: `${formItemNamePrefix}AppInstallButton`,
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

              if (hasAppInstallButtonBeenClicked) {
                // app reinstall
                isAppInstalled = false
                hasAppInstallationFinished = false
                appInstallationError = ''
              }
              hasAppInstallButtonBeenClicked = true

              // steps visibility update isn't triggered on component-level variable change,
              // have to trigger it manually
              // P.S: signal also doesn't help
              await refreshStepsVisibility()
            },
          },
        },
        when: async (formValue: T) => {
          const isInstallationFailed = hasAppInstallationFinished && appInstallationError !== ''
          return (
            (await showAppFormItems(formValue)) &&
            !isAppInstalled &&
            (!hasAppInstallButtonBeenClicked || isInstallationFailed)
          )
        },
      },
      {
        type: 'button',
        name: `${formItemNamePrefix}AppInstallationCheckButton`,
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
                  appInstallationError = "That didn't work. Try re-installing the app."
                }
              } catch (error) {
                appInstallationError = "That didn't work. Try re-installing the app."
              } finally {
                hasAppInstallationFinished = true

                // steps visibility update isn't triggered on component-level variable change,
                // have to trigger it manually
                // P.S: signal also doesn't help
                await refreshStepsVisibility()
              }
            },
            glyph: 'refresh',
          },
        },
        when: async (formValue: T) =>
          (await showAppFormItems(formValue)) &&
          !isAppInstalled &&
          hasAppInstallButtonBeenClicked &&
          !hasAppInstallationFinished,
      },
      {
        type: 'message-strip',
        name: `${formItemNamePrefix}AppInstallationErrorStrip`,
        message: '',
        when: async (formValue: T) =>
          (await showAppFormItems(formValue)) &&
          !isAppInstalled &&
          hasAppInstallationFinished &&
          !!appInstallationError,
        guiOptions: {
          additionalData: <FormGeneratorMessageStripAdditionalData>{
            type: 'error',
            message: () => Promise.resolve(appInstallationError),
          },
        },
      },
      {
        type: 'validator',
        name: `${formItemNamePrefix}AppInstallationErrorStripValidator`,
        message: 'SUGAR app',
        validate: () => Promise.resolve(appInstallationError),
        when: async (formValue: T) =>
          (await showAppFormItems(formValue)) &&
          !isAppInstalled &&
          hasAppInstallationFinished &&
          !!appInstallationError,
      },
      {
        type: 'object-status',
        name: `${formItemNamePrefix}AppInstallationSuccess`,
        message: '',
        when: async (formValue: T) =>
          (await showAppFormItems(formValue)) && !isAppInstalled && hasAppInstallationFinished && !appInstallationError,
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
  }
}
