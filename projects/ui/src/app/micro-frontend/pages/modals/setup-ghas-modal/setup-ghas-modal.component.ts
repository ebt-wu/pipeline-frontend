import { CommonModule, NgFor } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ProgrammingLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds, Languages, StepKey, ValidationTools } from '@enums'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import {
  DynamicFormItem,
  FormGeneratorComponent,
  FormGeneratorService,
  FundamentalNgxPlatformModule,
  PlatformMessagePopoverModule,
} from '@fundamental-ngx/platform'
import { BuildTool, Orchestrators } from '@generated/graphql'
import { EntityContext, Pipeline, ResourceRef, ProgrammingLanguage } from '@types'
import { debounceTime, firstValueFrom, Observable, Subscription } from 'rxjs'
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component'
import { PlatformFormGeneratorCustomInfoBoxComponent } from '../../../components/form-generator/form-generator-info-box/form-generator-info-box.component'
import { PlatformFormGeneratorCustomMessageStripComponent } from '../../../components/form-generator/form-generator-message-strip/form-generator-message-strip.component'
import { PlatformFormGeneratorCustomValidatorComponent } from '../../../components/form-generator/form-generator-validator/form-generator-validator.component'
import { GithubActionsFormService } from '../../../services/forms/github-actions-form.service'
import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubAdvancedSecurityService } from '../../../services/github-advanced-security.service'
import { GithubService } from '../../../services/github.service'
import { PipelineService } from '../../../services/pipeline.service'

function getRecommendedValidationTool(language: Languages): ValidationTools | null {
  switch (language) {
    case Languages.PYTHON:
    case Languages.JAVA:
      return ValidationTools.GHAS
    case Languages.JAVASCRIPT:
    case Languages.GO:
    case Languages.GROOVY:
    case Languages.RUBY:
    case Languages.SWIFT:
    case Languages.PHP:
      return ValidationTools.CX
    default:
      return null
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-setup-ghas',
  templateUrl: './setup-ghas-modal.component.html',
  styleUrl: './setup-ghas-modal.component.css',
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
export class SetupGhasModalComponent implements OnInit, OnDestroy {
  githubResourceExists = signal(false)

  languages = Languages
  validationTools = ValidationTools
  validationToolsArray = Object.keys(ValidationTools)
  languageSelectionFormChange: Subscription = null
  watch$: Observable<Pipeline>
  loading = signal(false)
  selectionOptions = signal([])
  recommendedLanguage = signal({} as ProgrammingLanguage)
  recommendedValidationTool = signal<ValidationTools | null>(null)
  errorMessage = signal('')

  languageSelection = new FormControl(null as ProgrammingLanguage)
  toolSelection = new FormControl(null)
  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent
  formItems: DynamicFormItem[] = []

  constructor(
    private luigiClient: LuigiClient,
    private readonly githubService: GithubService,
    private readonly pipelineService: PipelineService,
    private readonly githubAdvancedSecurityService: GithubAdvancedSecurityService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly _formGeneratorService: FormGeneratorService,
    private readonly githubActionsService: GithubActionsService,
    private readonly githubActionsFormService: GithubActionsFormService,
  ) {
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomInfoBoxComponent, ['info'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomMessageStripComponent, ['message-strip'])
    this._formGeneratorService.addComponent(PlatformFormGeneratorCustomValidatorComponent, ['validator'])
  }

  async ngOnInit() {
    this.loading.set(true)
    await this.recommendLanguage()

    this.languageSelectionFormChange = this.languageSelection.valueChanges.subscribe((language) => {
      this.recommendedValidationTool.set(getRecommendedValidationTool(language.id))
      this.toolSelection.reset()
    })
    this.languageSelection.patchValue(this.recommendedLanguage())

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))

    const refs = (await firstValueFrom(this.watch$)).resourceRefs
    if (refs.find((ref) => ref.kind === Kinds.GITHUB_REPOSITORY)) {
      this.githubResourceExists.set(true)
    }
    this.formItems = await this.githubActionsFormService.buildFormItems(
      this.refreshStepsVisibility.bind(this) as () => Promise<void>,
    )

    this.loading.set(false)
  }

  ngOnDestroy() {
    this.languageSelectionFormChange.unsubscribe()
  }

  async refreshStepsVisibility() {
    await this.formGenerator.refreshStepsVisibility()
  }

  async recommendLanguage() {
    const githubLanguages = (await firstValueFrom(this.githubService.getComponentExtensions())).languages.Languages
    const recommendedLanguage = this.githubService.getMostUsedLanguage(githubLanguages, ProgrammingLanguages)
    this.recommendedLanguage.set(recommendedLanguage)
    this.selectionOptions.set(ProgrammingLanguages)
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

  getOrchestrator(kinds: (Kinds | StepKey)[]) {
    if (kinds.includes(Kinds.JENKINS_PIPELINE)) {
      return Orchestrators.Jenkins
    } else if (kinds.includes(Kinds.GITHUB_ACTIONS_PIPELINE)) {
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
      await this.createGithubResource()
    }

    // set assumedBuildTool depending on what the user selected as a language
    switch (this.languageSelection.value.id) {
      case Languages.JAVA:
        assumedBuildTool = BuildTool.Maven
        break
      case Languages.PYTHON:
        assumedBuildTool = BuildTool.Python
        break
      default:
        assumedBuildTool = null
    }

    const labels = (await firstValueFrom(this.watch$)).labels

    try {
      await firstValueFrom(
        this.githubAdvancedSecurityService.createGithubAdvancedSecurity({
          codeScanJobOrchestrator: metadata.codeScanJobOrchestrator,
          buildTool: assumedBuildTool,
          labels: labels,
        }),
      )

      this.luigiClient.uxManager().closeCurrentModal()
    } catch (error) {
      const errorMessage = (error as Error).message
      this.errorMessage.set(errorMessage)
    } finally {
      this.loading.set(false)
    }
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
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/ghas.html',
        '_blank',
        'noopener, noreferrer',
      )
    } else if (tool === ValidationTools.CX) {
      window.open(
        'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/cxone.html',
        '_blank',
        'noopener, noreferrer',
      )
    }
  }

  async createGithubResource(): Promise<void> {
    const context = await this.luigiService.getContextAsync()
    const entityContext = context.entityContext as unknown as EntityContext

    const repoUrl: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-url'] ?? ''
    const login: string = entityContext?.component?.annotations?.['github.dxp.sap.com/login'] ?? ''
    const repoName: string = entityContext?.component?.annotations?.['github.dxp.sap.com/repo-name'] ?? ''

    const githubRepoUrl = new URL(repoUrl)

    try {
      await firstValueFrom(this.githubService.createGithubRepository(githubRepoUrl.origin, login, repoName, false))
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage) {
        this.errorMessage.set(errorMessage)
      } else {
        this.errorMessage.set('Unknown error')
      }
    }
  }
}
