import { CommonModule, NgFor } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ValidationLanguages } from '@constants'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Kinds, ValidationTools } from '@enums'
import { FormattedTextModule, FormModule, FundamentalNgxCoreModule, RadioModule } from '@fundamental-ngx/core'
import { FundamentalNgxPlatformModule, PlatformMessagePopoverModule } from '@fundamental-ngx/platform'
import { Orchestrators } from '@generated/graphql'
import { Pipeline, ResourceRef, ValidationLanguage } from '@types'
import { debounceTime, firstValueFrom, Observable, Subscription } from 'rxjs'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { GithubAdvancedSecurityService } from '../../services/github-advanced-security.service'
import { GithubService } from '../../services/github.service'
import { PipelineService } from '../../services/pipeline.service'

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
  constructor(
    private readonly githubService: GithubService,
    private readonly pipelineService: PipelineService,
    private readonly githubAdvancedSecurityService: GithubAdvancedSecurityService,
    private readonly luigiService: DxpLuigiContextService,
    private luigiClient: LuigiClient,
  ) {}

  validationTools = ValidationTools
  validationToolsArray = Object.keys(ValidationTools)
  languageSelectionFormChange: Subscription = null
  watch$: Observable<Pipeline>
  loading = false
  selectionOptions = signal([])
  recommendedLanguage = signal({} as ValidationLanguage)
  errorMessage = signal('')

  languageSelection = new FormControl(null as ValidationLanguage)
  toolSelection = new FormControl(null)

  async ngOnInit() {
    await this.recommendLanguage()
    this.languageSelection.patchValue(this.recommendedLanguage())
    this.languageSelectionFormChange = this.languageSelection.valueChanges.subscribe(() => {
      this.toolSelection.reset()
    })

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
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
    const metadata = await this.getMetadata()
    this.loading = true

    await firstValueFrom(
      this.githubAdvancedSecurityService.createGithubAdvancedSecurity(
        metadata.githubInstance,
        metadata.githubOrganization,
        metadata.githubRepository,
        metadata.codeScanJobOrchestrator,
      ),
    )
      .then(() => {
        this.loading = false
        this.luigiClient.uxManager().closeCurrentModal()
      })
      .catch((err) => {
        this.loading = false
        this.errorMessage.set(err)
      })
  }

  cancel() {
    this.luigiClient.uxManager().closeCurrentModal()
  }

  onButtonClickInstallManually() {
    window.open('https://github.wdf.sap.corp/pages/Security-Testing/doc/cxone/Getting_Started/', '_blank')
  }

  onButtonLearnMore() {
    window.open('https://github.wdf.sap.corp/pages/Security-Testing/doc/security%20testing/tools/', '_blank')
  }

  onButtonClickShowRoadmap() {
    // FIXME: link to the roadmap
    window.open('https://google.com/', '_blank')
  }
}
