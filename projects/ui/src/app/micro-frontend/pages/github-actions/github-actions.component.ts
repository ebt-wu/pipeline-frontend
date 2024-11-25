import { Component, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core'

import {
  DynamicFormItem,
  DynamicFormValue,
  FormGeneratorComponent,
  FormGeneratorService,
} from '@fundamental-ngx/platform/form'
import { NgIf } from '@angular/common'
import { FundamentalNgxPlatformModule, PlatformMessagePopoverModule } from '@fundamental-ngx/platform'
import { firstValueFrom } from 'rxjs'
import { CredentialTypes } from '@enums'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { SecretData, SecretService } from '../../services/secret.service'
import { PlatformFormGeneratorCustomHeaderElementComponent } from '../../components/form-generator/form-generator-header/form-generator-header.component'
import { BarModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { GithubActionsService } from '../../services/github-actions.service'
import { APIService } from '../../services/api.service'
import { GithubMetadata, REQUIRED_SCOPES } from '../../services/github.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../components/form-generator/form-generator-validator/form-generator-validator.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-github-actions',
  templateUrl: './github-actions.component.html',
  styleUrl: './github-actions.component.css',
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
  githubMetadata: GithubMetadata

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  constructor(
    private luigiClient: LuigiClient,
    private readonly api: APIService,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly secretService: SecretService,
    private readonly githubActionsService: GithubActionsService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomHeaderElementComponent, ['header'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  async ngOnInit() {
    this.githubMetadata = await this.api.githubService.getGithubMetadata()
  }

  githubActionFormItems: DynamicFormItem[] = [...this.api.githubService.GITHUB_CREDENTIAL_FORM]

  onFormCreated(): void {
    this.formCreated = true
  }

  async onFormSubmitted(value: Record<string, string>): Promise<void> {
    this.formValue = value
    this.loading = true
    let githubActionsCredVaultPath: string

    try {
      if (value.githubCredentialType === CredentialTypes.NEW.toString()) {
        const userQueryResp = await fetch(`${this.githubMetadata.githubInstance}/api/v3/user`, {
          headers: {
            Authorization: `Bearer ${value.githubToken}`,
          },
        })
        const user: string = ((await userQueryResp.json()) as Record<string, string>)?.login
        const secretData: SecretData[] = [
          { key: 'username', value: user },
          { key: 'access_token', value: value.githubToken },
          { key: 'scopes', value: REQUIRED_SCOPES.join(',') },
        ]
        githubActionsCredVaultPath = this.getVaultPath(user)
        await firstValueFrom(this.secretService.writeSecret(githubActionsCredVaultPath, secretData))
      } else if (value.githubCredentialType === CredentialTypes.EXISTING.toString()) {
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

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  submitForm(): void {
    this.formGenerator.submit()
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  private getVaultPath(user: string): string {
    return `GROUP-SECRETS/${this.getGithubActionsCredentialName(user)}`
  }

  /**
   * Returns the name of the secret for the GithubActions credentials based on the github hostname. Replaces all dots in the hostname with dashes.
   * @private
   */
  private getGithubActionsCredentialName(user: string) {
    return `${this.githubMetadata.githubHostName.replace(/\./g, '-')}-${user}`
  }
}
