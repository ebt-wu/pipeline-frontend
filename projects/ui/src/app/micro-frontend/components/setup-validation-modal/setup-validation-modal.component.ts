import { CommonModule, NgFor } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ValidationLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds, ValidationTools } from '@enums'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import {
  DynamicFormItem,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
  PlatformMessagePopoverModule,
} from '@fundamental-ngx/platform'
import { BuildTool, Orchestrators } from '@generated/graphql'
import { EntityContext, ghTokenFormValue, Pipeline, ResourceRef, ValidationLanguage } from '@types'
import { debounceTime, firstValueFrom, Observable, Subscription } from 'rxjs'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { GithubAdvancedSecurityService } from '../../services/github-advanced-security.service'
import { GithubService } from '../../services/github.service'
import { PipelineService } from '../../services/pipeline.service'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../form-generator/form-generator-info-box/form-generator-info-box.component'
import { SecretData, SecretService } from '../../services/secret.service'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../form-generator/form-generator-message-strip/form-generator-message-strip.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-validation',
  templateUrl: './setup-validation-modal.component.html',
  styleUrl: './setup-validation-modal.component.css',
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
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
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
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext
    const repoUrl = entityContext?.component?.annotations['github.dxp.sap.com/repo-url'] ?? null

    let gitRepoLanguages: Record<string, number>
    try {
      gitRepoLanguages = await this.githubService.getRepositoryLanguages(this.luigiClient, this.luigiService, repoUrl)
    } catch (error) {
      this.errorMessage.set((error as Error).message)
    }

    const languagesMap = new Map(Object.entries(gitRepoLanguages))
    // convert map into array of pairs : [ [key, value] , ... ] and take whatever key is found the most so [0]
    const foundLanguage = Array.from(languagesMap.entries()).reduce(
      (prevEntry, nextEntry) => (prevEntry[1] > nextEntry[1] ? prevEntry : nextEntry),
      0,
    )[0] as string

    // If there is no language found in the GH repo, use "other". Otherwise use whatever we find in GH.
    this.recommendedLanguage.set(ValidationLanguages.find((lang) => lang.id === 'other'))
    ValidationLanguages.forEach((language) => {
      if (language.githubLinguistName === foundLanguage) {
        this.recommendedLanguage.set(language)
      }
    })

    this.selectionOptions.set(ValidationLanguages)
  }

  async getMetadata() {
    const refs: ResourceRef[] = (await firstValueFrom(this.watch$)).resourceRefs
    const kinds = refs.map((ref) => ref.kind)
    const orchestrator = this.getOrchestrator(kinds)

    const githubMetadata = await this.githubService.getGithubMetadata()

    return {
      githubInstance: githubMetadata.githubInstance,
      githubOrganization: githubMetadata.githubOrgName,
      githubRepository: githubMetadata.githubRepoName,
      codeScanJobOrchestrator: orchestrator,
    }
  }
  getOrchestrator(kinds: Kinds[]) {
    if (kinds.includes(Kinds.JENKINS_PIPELINE)) {
      return Orchestrators.Jenkins
    } else if (kinds.includes(Kinds.GITHUB_ACTION)) {
      return Orchestrators.GitHubActions
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
      const formVal = (this.formGenerator.formGroup.form.value as { ungrouped: ghTokenFormValue }).ungrouped
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

    const labels = (await firstValueFrom(this.watch$)).labels

    await firstValueFrom(
      this.githubAdvancedSecurityService.createGithubAdvancedSecurity({
        githubInstance: metadata.githubInstance,
        githubOrganization: metadata.githubOrganization,
        githubRepository: metadata.githubRepository,
        codeScanJobOrchestrator: metadata.codeScanJobOrchestrator,
        buildTool: assumedBuildTool,
        labels: labels,
      }),
    )
      .then(() => {
        this.luigiClient.uxManager().closeCurrentModal()
      })
      .catch((error) => {
        const errorMessage = (error as Error).message
        this.errorMessage.set(errorMessage)
      })
      .finally(() => {
        this.loading.set(false)
      })
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  onButtonClickInstallManually() {
    window.open(
      'https://github.wdf.sap.corp/pages/Security-Testing/doc/cxone/Getting_Started/',
      '_blank',
      'noopener, noreferrer',
    )
  }

  onButtonLearnMore(tool: ValidationTools) {
    if (tool === ValidationTools.GHAS) {
      window.open(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/ghas.html',
        '_blank',
        'noopener, noreferrer',
      )
    } else if (tool === ValidationTools.CX) {
      window.open(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/cxone.html',
        '_blank',
        'noopener, noreferrer',
      )
    }
  }

  async createGithubResource(value: ghTokenFormValue): Promise<void> {
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext

    const repoUrl: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login: string = entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''

    const githubRepoUrl = new URL(repoUrl)

    try {
      const githubSecretPath = await this.githubService.storeGithubCredentials(value, githubRepoUrl)

      await firstValueFrom(
        this.githubService.createGithubRepository(githubRepoUrl.origin, login, repoName, githubSecretPath, false),
      )
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage) {
        this.errorMessage.set(errorMessage)
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
