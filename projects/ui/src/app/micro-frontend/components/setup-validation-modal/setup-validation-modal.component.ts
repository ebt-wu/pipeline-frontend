import { CommonModule, NgFor } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ValidationLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { CredentialTypes, Kinds, ValidationTools } from '@enums'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import {
  DynamicFormItem,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
  PlatformMessagePopoverModule,
} from '@fundamental-ngx/platform'
import { BuildTool, Orchestrators } from '@generated/graphql'
import { ghTokenFormValue, Pipeline, ResourceRef, ValidationLanguage } from '@types'
import { debounceTime, firstValueFrom, Observable, Subscription } from 'rxjs'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { GithubAdvancedSecurityService } from '../../services/github-advanced-security.service'
import { GithubService, REQUIRED_SCOPES } from '../../services/github.service'
import { PipelineService } from '../../services/pipeline.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../form-generator-info-box/form-generator-info-box.component'
import { SecretData, SecretService } from '../../services/secret.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-validation',
  templateUrl: './setup-validation-modal.component.html',
  styleUrls: ['./setup-validation-modal.component.css'],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    RadioModule,
    FormModule,
    FormattedTextModule,
    FundamentalNgxPlatformModule,
    ErrorMessageComponent,
    PlatformMessagePopoverModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
  ],
})
export class SetupValidationModalComponent implements OnInit, OnDestroy {
  githubResourceExists = signal(false)

  validationTools = ValidationTools
  validationToolsArray = Object.keys(ValidationTools)
  languageSelectionFormChange: Subscription = null
  watch$: Observable<Pipeline>
  loading = signal(false)
  selectionOptions = signal([])
  recommendedLanguage = signal({} as ValidationLanguage)
  errorMessage = signal('')

  languageSelection = new FormControl(null as ValidationLanguage)
  toolSelection = new FormControl(null)
  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  ghCredentialForm: DynamicFormItem[] = [...this.githubService.GITHUB_CREDENTIAL_FORM]

  constructor(
    private readonly githubService: GithubService,
    private readonly pipelineService: PipelineService,
    private readonly githubAdvancedSecurityService: GithubAdvancedSecurityService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly secretService: SecretService,
    private readonly _formGeneratorService: FormGeneratorService,
    private luigiClient: LuigiClient,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
  }

  async ngOnInit() {
    this.loading.set(true)
    await this.recommendLanguage()
    this.languageSelection.patchValue(this.recommendedLanguage())
    this.languageSelectionFormChange = this.languageSelection.valueChanges.subscribe(() => {
      this.toolSelection.reset()
    })
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))

    const refs = (await firstValueFrom(this.watch$)).resourceRefs
    if (refs.find((ref) => ref.kind === Kinds.GITHUB_REPOSITORY)) {
      this.githubResourceExists.set(true)
    }
    this.loading.set(false)
  }

  ngOnDestroy() {
    this.languageSelectionFormChange.unsubscribe()
  }

  async recommendLanguage() {
    const context = (await this.luigiService.getContextAsync()) as any
    const repoUrl = context.entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

    let gitRepoLanguages
    try {
      gitRepoLanguages = await this.githubService.getRepositoryLanguages(this.luigiClient, this.luigiService, repoUrl)
    } catch (error) {
      this.errorMessage.set(error)
    }

    const languagesMap = new Map(Object.entries(gitRepoLanguages))

    // If there is no language found in the GH repo, use "other". Otherwise use whatever we find in GH.
    this.recommendedLanguage.set(ValidationLanguages.find((lang) => lang.id === 'other'))
    ValidationLanguages.forEach((language) => {
      if (languagesMap.has(language.githubLinguistName)) {
        this.recommendedLanguage.set(language)
      }
    })

    this.selectionOptions.set(ValidationLanguages)
  }

  async getMetadata() {
    const refs: ResourceRef[] = (await firstValueFrom(this.watch$)).resourceRefs
    const kinds = refs.map((ref) => ref.kind)
    let orchestrator = null
    if (kinds.includes(Kinds.JENKINS_PIPELINE)) {
      orchestrator = Orchestrators.Jenkins
    } else if (kinds.includes(Kinds.GITHUB_ACTION)) {
      orchestrator = Orchestrators.GitHubActions
    }

    const githubMetadata = await this.githubService.getGithubMetadata()

    return {
      githubInstance: githubMetadata.githubInstance,
      githubOrganization: githubMetadata.githubOrgName,
      githubRepository: githubMetadata.githubRepoName,
      codeScanJobOrchestrator: orchestrator,
    }
  }

  dismissErrorMessage() {
    this.errorMessage.set('')
  }

  async submit() {
    let assumedBuildTool: BuildTool
    const metadata = await this.getMetadata()
    this.loading.set(true)

    if (!this.githubResourceExists()) {
      const formVal = this.formGenerator.formGroup.form.value.ungrouped as ghTokenFormValue
      await this.createGithubResource(formVal)
    }

    // set assumedbuildtool depending on what the user selected as a language
    switch (this.languageSelection.value.id) {
      case 'java':
        assumedBuildTool = BuildTool.Maven
        break
      case 'python':
        assumedBuildTool = BuildTool.Python
        break
      default:
        assumedBuildTool = null
    }
    await firstValueFrom(
      this.githubAdvancedSecurityService.createGithubAdvancedSecurity({
        githubInstance: metadata.githubInstance,
        githubOrganization: metadata.githubOrganization,
        githubRepository: metadata.githubRepository,
        codeScanJobOrchestrator: metadata.codeScanJobOrchestrator,
        buildTool: assumedBuildTool,
      }),
    )
      .then(() => {
        this.luigiClient.uxManager().closeCurrentModal()
      })
      .catch((err) => {
        this.errorMessage.set(err)
      })
      .finally(() => {
        this.loading.set(false)
      })
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  onButtonClickInstallManually() {
    window.open('https://github.wdf.sap.corp/pages/Security-Testing/doc/cxone/Getting_Started/', '_blank')
  }

  onButtonLearnMore(tool: ValidationTools) {
    if (tool === ValidationTools.GHAS) {
      window.open(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/ghas.html',
        '_blank',
      )
    } else if (tool === ValidationTools.CX) {
      window.open(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/cxone.html',
        '_blank',
      )
    }
  }

  async createGithubResource(value: ghTokenFormValue): Promise<void> {
    const context = (await this.luigiService.getContextAsync()) as any

    const repoUrl: string = context.entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login: string = context.entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName: string = context.entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''

    const githubRepoUrl = new URL(repoUrl)

    try {
      let githubSecretPath: string

      if (value.githubCredentialType === CredentialTypes.NEW) {
        const { githubInstance } = await this.githubService.getGithubMetadata()
        const userQueryResp = await fetch(`${githubInstance}/api/v3/user`, {
          headers: {
            Authorization: `Bearer ${value.githubToken}`,
          },
        })
        const user = (await userQueryResp.json())?.login
        const secretData: SecretData[] = [
          { key: 'username', value: user },
          { key: 'scopes', value: REQUIRED_SCOPES.join(',') },
          { key: 'access_token', value: value.githubToken },
        ]
        githubSecretPath = await this.storeCredential(
          // replace the dots in the hostname with dashes to avoid issues with vault path
          `${githubRepoUrl.hostname.replace(/\./g, '-')}`,
          secretData,
          user,
        )
        await firstValueFrom(this.secretService.writeSecret(githubSecretPath, secretData))
      } else if (value.githubCredentialType === CredentialTypes.EXISTING) {
        githubSecretPath = this.getCredentialPath(value.githubSelectCredential, context.componentId)
      }

      if (!repoUrl || !login || !repoName) {
        throw new Error('Could not get GitHub repository details from frame context')
      }

      await firstValueFrom(
        this.githubService.createGithubRepository(githubRepoUrl.origin, login, repoName, githubSecretPath, false),
      )
    } catch (e: any) {
      if (e.message) {
        this.errorMessage.set(e.message)
      } else {
        this.errorMessage.set('Unknown error')
      }
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
}
