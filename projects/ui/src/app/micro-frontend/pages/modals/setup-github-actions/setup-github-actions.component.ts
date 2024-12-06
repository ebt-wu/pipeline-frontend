import { Component, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core'
import { DynamicFormItem, FormGeneratorComponent, FormGeneratorService } from '@fundamental-ngx/platform/form'
import { NgIf } from '@angular/common'
import { FundamentalNgxPlatformModule, PlatformMessagePopoverModule } from '@fundamental-ngx/platform'
import { firstValueFrom } from 'rxjs'
import { CredentialTypes } from '@enums'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { SecretData, SecretService } from '../../../services/secret.service'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubMetadata, GithubService, REQUIRED_SCOPES } from '../../../services/github.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { PlatformFormGeneratorCustomButtonComponent } from '../../../components/form-generator/form-generator-button/form-generator-button.component'
import { PlatformFormGeneratorCustomObjectStatusComponent } from '../../../components/form-generator/form-generator-object-status/form-generator-object-status.component'
import { FeatureFlagService } from '../../../services/feature-flag.service'
import { GithubActionsFormService, GithubActionsFormValueP } from '../../../services/forms/github-actions-form.service'

type SetupGithubActionsFormPrefix = 'github'
type SetupGithubActionsFormValue = GithubActionsFormValueP<SetupGithubActionsFormPrefix>

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-github-actions',
  templateUrl: './setup-github-actions.component.html',
  styleUrl: './setup-github-actions.component.css',
  imports: [
    FormGeneratorComponent,
    NgIf,
    PlatformMessagePopoverModule,
    FundamentalNgxPlatformModule,
    FundamentalNgxCoreModule,
    ErrorMessageComponent,
  ],
})
export class GithubActionsComponent implements OnInit {
  errorMessage = signal('')
  loading = signal(true)

  githubMetadata: GithubMetadata

  formCreated = false
  formItems: DynamicFormItem[] = []

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  constructor(
    private luigiClient: LuigiClient,
    private luigiService: DxpLuigiContextService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubService: GithubService,
    private readonly githubActionsService: GithubActionsService,
    private readonly githubActionsFormService: GithubActionsFormService,
  ) {
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomButtonComponent, ['button'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
    this.formGeneratorService.addComponent(PlatformFormGeneratorCustomObjectStatusComponent, ['object-status'])
  }

  async ngOnInit() {
    this.githubMetadata = await this.githubService.getGithubMetadata()

    const [formItems, isSolinasAppInstalled] = await Promise.all([
      this.githubActionsFormService.buildFormItems<SetupGithubActionsFormValue, SetupGithubActionsFormPrefix>(
        'github',
        () => true,
        this.refreshStepsVisibility.bind(this) as () => Promise<void>,
      ),
      firstValueFrom(
        this.githubActionsService.getGithubActionSolinasVerification(
          this.githubMetadata.githubOrgName,
          this.githubMetadata.githubRepoUrl,
        ),
      ),
    ])

    this.formItems = [
      ...formItems,
      {
        type: 'message-strip',
        name: 'solinasAppAlreadyInstalledMessage',
        message: '',
        guiOptions: {
          additionalData: <FormGeneratorMessageStripAdditionalData>{
            type: 'success',
            message: () => Promise.resolve('You have everything in place to get started!'),
          },
        },
        when: () => isSolinasAppInstalled,
      },
    ]

    this.loading.set(false)
  }

  onFormCreated(): void {
    this.formCreated = true
  }

  async refreshStepsVisibility() {
    await this.formGenerator.refreshStepsVisibility()
  }

  async onFormSubmitted(formValue: SetupGithubActionsFormValue): Promise<void> {
    const context = await this.luigiService.getContextAsync()
    const isSugarRegistrationEnabled = await this.featureFlagService.isSugarRegistrationEnabled(context.projectId)

    if (isSugarRegistrationEnabled) {
      return await this.onGithubAppFormSubmit()
    }

    return await this.onGithubPatFormSubmit(formValue)
  }

  // TODO: rename this function to onFormSubmitted() with sugar app feature-flag removal
  async onGithubAppFormSubmit(): Promise<void> {
    this.loading.set(true)

    try {
      await firstValueFrom(
        this.githubActionsService.createGithubActions(
          this.githubMetadata.githubInstance,
          this.githubMetadata.githubOrgName,
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

  // TODO: remove this function with sugar app feature-flag removal
  async onGithubPatFormSubmit(formValue: SetupGithubActionsFormValue): Promise<void> {
    this.loading.set(true)
    let vaultPath: string

    try {
      if (formValue.githubCredentialType === CredentialTypes.NEW) {
        const userQueryResp = await fetch(`${this.githubMetadata.githubInstance}/api/v3/user`, {
          headers: {
            Authorization: `Bearer ${formValue.githubToken}`,
          },
        })
        const user: string = ((await userQueryResp.json()) as Record<string, string>)?.login

        const secretData: SecretData[] = [
          { key: 'username', value: user },
          { key: 'access_token', value: formValue.githubToken },
          { key: 'scopes', value: REQUIRED_SCOPES.join(',') },
        ]
        // Replace all dots in the hostname with dashes
        const credentialName = `${this.githubMetadata.githubHostName.replace(/\./g, '-')}-${user}`
        vaultPath = `GROUP-SECRETS/${credentialName}`

        await firstValueFrom(this.secretService.writeSecret(vaultPath, secretData))
      } else if (formValue.githubCredentialType === CredentialTypes.EXISTING) {
        vaultPath = formValue.githubSelectCredential
      }
      await firstValueFrom(
        this.githubActionsService.createGithubActions(
          this.githubMetadata.githubInstance,
          this.githubMetadata.githubOrgName,
          vaultPath,
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

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }
}
