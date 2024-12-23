import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { GithubInstances } from '@enums'
import { DynamicFormItem, FormGeneratorService } from '@fundamental-ngx/platform'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { GithubService } from '../github.service'
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

@Injectable({ providedIn: 'root' })
export class GithubActionsFormService {
  constructor(
    private readonly debugModeService: DebugModeService,
    private readonly githubService: GithubService,
    private readonly githubActionsService: GithubActionsService,
    private readonly formGeneratorService: FormGeneratorService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomButtonComponent, ['button'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomObjectStatusComponent, ['object-status'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  public async buildFormItems<T>(
    refreshStepsVisibility: () => Promise<void>,
    showFormItems?: (formValue: T) => boolean | Promise<boolean>,
  ): Promise<DynamicFormItem[]> {
    let isAppInstalled = false
    let hasAppInstallButtonBeenClicked = false
    let hasAppInstallationFinished = false
    let appInstallationError = ''
    showFormItems = showFormItems || (() => true)

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

    return [
      {
        type: 'header',
        name: `sugarAppHeader`,
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorHeaderAdditionalData>{
            header: 'Install runners app',
            ignoreTopMargin: true,
            subheader: async () => {
              const { githubOrgName } = await this.githubService.getGithubMetadata()
              return `Install the SUGAR app to add runners to your GitHub Organization:<br /><b>${githubOrgName}</b>`
            },
            subheaderStyle: {
              'font-size': '14px',
            },
          },
        },
        when: async (formValue: T) => (await showFormItems(formValue)) && !isAppInstalled,
      },
      {
        type: 'validator',
        name: `sugarAppRequiredValidator`,
        message: 'SUGAR app',
        validate: () => Promise.resolve("Can't finish the setup without SUGAR app"),
        when: async (formValue: T) =>
          (await showFormItems(formValue)) && !isAppInstalled && !hasAppInstallationFinished,
      },
      {
        type: 'button',
        name: `sugarAppInstallButton`,
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorButtonAdditionalData>{
            type: 'emphasized',
            label: 'Install App',
            glyph: 'action',
            action: async () => {
              const githubAppInstallationToolsLinks = {
                live: 'https://github.tools.sap/github-apps/sugar',
                int: 'https://github.tools.sap/github-apps/sugar-dev',
                dev: 'https://github.tools.sap/github-apps/sugar-dev',
              }
              const githubAppInstallationWdfLinks = {
                live: 'https://github.wdf.sap.corp/github-apps/sugar',
                int: 'https://github.wdf.sap.corp/github-apps/sugar-dev',
                dev: 'https://github.wdf.sap.corp/github-apps/sugar-dev',
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
            (await showFormItems(formValue)) &&
            !isAppInstalled &&
            (!hasAppInstallButtonBeenClicked || isInstallationFailed)
          )
        },
      },
      {
        type: 'button',
        name: `sugarAppInstallationCheckButton`,
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorButtonAdditionalData>{
            type: 'standard',
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
          (await showFormItems(formValue)) &&
          !isAppInstalled &&
          hasAppInstallButtonBeenClicked &&
          !hasAppInstallationFinished,
      },
      {
        type: 'message-strip',
        name: `sugarAppInstallationErrorStrip`,
        message: '',
        when: async (formValue: T) =>
          (await showFormItems(formValue)) && !isAppInstalled && hasAppInstallationFinished && !!appInstallationError,
        guiOptions: {
          additionalData: <FormGeneratorMessageStripAdditionalData>{
            type: 'error',
            message: () => Promise.resolve(appInstallationError),
          },
        },
      },
      {
        type: 'validator',
        name: `sugarAppInstallationErrorStripValidator`,
        message: 'SUGAR app',
        validate: () => Promise.resolve(appInstallationError),
        when: async (formValue: T) =>
          (await showFormItems(formValue)) && !isAppInstalled && hasAppInstallationFinished && !!appInstallationError,
      },
      {
        type: 'object-status',
        name: `sugarAppInstallationSuccess`,
        message: '',
        when: async (formValue: T) =>
          (await showFormItems(formValue)) && !isAppInstalled && hasAppInstallationFinished && !appInstallationError,
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
