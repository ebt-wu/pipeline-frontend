import { NgIf } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, signal, ViewChild } from '@angular/core'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule, PlatformMessagePopoverModule } from '@fundamental-ngx/platform'
import { DynamicFormItem, FormGeneratorComponent, FormGeneratorService } from '@fundamental-ngx/platform/form'
import { firstValueFrom } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import { PlatformFormGeneratorCustomButtonComponent } from '../../../components/form-generator/form-generator-button/form-generator-button.component'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../../../components/form-generator/form-generator-header/form-generator-header.component'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import {
  FormGeneratorMessageStripAdditionalData,
  PlatformFormGeneratorCustomMessageStripComponent,
} from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomObjectStatusComponent } from '../../../components/form-generator/form-generator-object-status/form-generator-object-status.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { GithubActionsFormService } from '../../../services/forms/github-actions-form.service'
import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubMetadata, GithubService } from '../../../services/github.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private readonly formGeneratorService: FormGeneratorService,
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
      this.githubActionsFormService.buildFormItems(this.refreshStepsVisibility.bind(this) as () => Promise<void>),
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
          additionalData: {
            type: 'success',
            message: () => Promise.resolve('You have everything in place to get started!'),
          } as FormGeneratorMessageStripAdditionalData,
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

  async onFormSubmitted(): Promise<void> {
    this.loading.set(true)

    try {
      await firstValueFrom(this.githubActionsService.createStandaloneGithubActionsClaim())
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
