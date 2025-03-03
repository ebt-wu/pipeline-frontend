import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DxpLuigiContextService, LuigiClient, LuigiDialogUtil } from '@dxp/ngx-core/luigi'
import { Categories, Kinds, ServiceStatus, Stages, StepKey } from '@enums'
import {
  FlexibleColumnLayout,
  FundamentalNgxCoreModule,
  IconModule,
  InlineHelpModule,
  MessageBoxRef,
  MessageBoxService,
  MessageToastService,
} from '@fundamental-ngx/core'
import { DeletionPolicy } from '@generated/graphql'
import { debounceTime, firstValueFrom, Observable, Subscription, tap } from 'rxjs'
import { KindCategory, KindExtensionName, KindName } from '@constants'
import { Pipeline } from '@types'
import { DeleteBuildModalComponent } from '../modals/delete-build-modal/delete-build-modal.component'
import { DismissibleMessageComponent } from '../../components/dismissible-message/dismissible-message.component'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { APIService } from '../../services/api.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { ExtensionService } from '../../services/extension.service'
import { ExtensionClass } from '../../services/extension.types'
import { FeatureFlagService } from '../../services/feature-flag.service'
import { GithubMetadata } from '../../services/github.service'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { ResourceStagePipe } from '../../pipes/resource-stage.pipe'
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform'
import { PolicyService } from '../../services/policy.service'
import { PipelineService } from '../../services/pipeline.service'
import { map } from 'rxjs/operators'
import { CategorySlotComponent } from '../../components/category-slot/category-slot.component'
import { ValidateCodeSectionComponent } from '../../components/validate-code-section/validate-code-section.component'
import { GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { ServiceDetailsSkeletonComponent } from '../../components/service-details-skeleton/service-details-skeleton.component'
import { CategorySlotConfigService } from '../../services/category-slot-config.service'
import { AutomateWorkflowsComponent } from '../../components/automate-workflows/automate-workflows.component'

type Error = {
  title: string
  message: string
  resourceName: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  standalone: true,
  styleUrl: './pipeline.component.css',
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    RouterModule,
    IconModule,
    InlineHelpModule,
    ErrorMessageComponent,
    DismissibleMessageComponent,
    ServiceDetailsSkeletonComponent,
    AuthorizationModule,
    ResourceStagePipe,
    DynamicPageTitleComponent,
    DynamicPageHeaderComponent,
    DynamicPageComponent,
    DynamicPageContentComponent,
    DynamicPageGlobalActionsComponent,
    CategorySlotComponent,
    ValidateCodeSectionComponent,
    AutomateWorkflowsComponent,
  ],
})
export class PipelineComponent implements OnInit, OnDestroy {
  @Input() pipeline$!: Observable<Pipeline>

  loading = signal(true)

  isBuildStageOpen = signal(false)
  isBuildStageSetup = signal(false)
  isBuildPipelineSetupAndCreated = signal(false)

  isStaticSecurityChecksSetup = signal(false)
  isStaticCodeChecksSetup = signal(false)
  isOpenSourceChecksSetup = signal(false)

  isValidationStageOpen = signal(false)
  isDeployStageOpen = signal(false)
  // hacky workaround solution
  pendingDeletion = signal(false)
  pendingOpenPipeline = signal(false)
  pendingShowCredentials = signal(false)
  pendingExtensionClass = signal(false)
  catalogUrl = signal('')
  errors = signal<Map<string, Error>>(new Map())
  extensionClasses = signal<ExtensionClass[]>([])

  // Feature flags
  showGithubActions = signal(false)
  showOSC = signal(false)

  canUserEditCredentials = false

  isTransferredTemplatePipeline = signal(false)
  isSugarAppInstalled = signal(false)

  localLayout: FlexibleColumnLayout = 'OneColumnStartFullScreen'
  activeCategory: Categories = null
  githubMetadata: GithubMetadata
  projectId: string
  // maps
  kindName = KindName
  kinds = Kinds
  serviceStatus = ServiceStatus
  categories = Categories
  kindCategory = KindCategory
  stages = Stages
  openPrCount$: Observable<number>
  pipelineURL = signal('')
  private pipelineSubscription: Subscription
  private jenkinsPipelineError = false

  constructor(
    public messageToastService: MessageToastService,
    private readonly luigiClient: LuigiClient,
    private readonly api: APIService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly extensionService: ExtensionService,
    private readonly messageBoxService: MessageBoxService,
    private readonly luigiDialogUtil: LuigiDialogUtil,
    private readonly featureFlagService: FeatureFlagService,
    readonly debugModeService: DebugModeService,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
    private readonly policyService: PolicyService,
    private readonly pipelineService: PipelineService,
  ) {}

  get showOpenPipelineURL(): boolean {
    return this.isBuildStageSetup() && !this.pendingDeletion() && !this.jenkinsPipelineError
  }

  async ngOnInit() {
    this.githubMetadata = await this.api.githubService.getGithubMetadata()

    const context = await this.luigiService.getContextAsync()
    this.catalogUrl.set(context.frameBaseUrl + '/marketplace')
    this.projectId = context.projectId

    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

    // Only show GHA and GHAS if their feature flags are toggled on
    this.showGithubActions.set(await this.featureFlagService.isGithubActionsEnabled())
    this.showOSC.set(await this.featureFlagService.isOscEnabled())

    try {
      await Promise.all([this.getExtensionClasses(), this.checkSugarAppInstallation()])
    } catch (e: unknown) {
      const error: Error = {
        title: 'Error retrieving CI/CD setup data',
        message: `Unable to load Sugar App installation or extension classes: ${e instanceof Error ? e.message : ''}`,
        resourceName: '-',
      }
      this.errors.update((errors) => errors.set(error.message, error))
    }

    this.openPrCount$ = this.api.githubService.getPullRequestInfo().pipe(
      map((prInfo) => {
        return this.calculateOpenPRCount(prInfo)
      }),
    )

    this.pipelineSubscription = this.pipeline$
      .pipe(
        debounceTime(100), // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        tap(async (pipeline) => {
          await this.getPipelineURL(pipeline)
        }),
      )
      .subscribe((pipeline: Pipeline) => {
        const errorMap: Map<string, Error> = new Map()
        const errorKeyPrefix = 'pipeline_subscription'

        this.isBuildPipelineSetupAndCreated.set(false)
        this.jenkinsPipelineError = false

        if (pipeline.notManagedServices?.pipelineCreationTimestamp) {
          this.isTransferredTemplatePipeline.set(true)
        }

        if (
          pipeline.githubActionsDetails &&
          pipeline.githubActionsDetails.enablementRef &&
          pipeline.githubActionsDetails.enablementRef.error
        ) {
          let message = ''
          // only print automaticd error number if it is present
          if (!!pipeline.githubActionsDetails.enablementRef.automaticdErrorNumber) {
            message += pipeline.githubActionsDetails.enablementRef.automaticdErrorNumber
          }
          message += pipeline.githubActionsDetails.enablementRef.error
          const error = {
            title: 'Configuration of GitHub Actions failed',
            resourceName: pipeline.githubActionsDetails.enablementRef.name,
            message: `<strong>Error: </strong> ${message}`,
          }
          errorMap.set(`${errorKeyPrefix}${error.message}`, error)
        }
        if (pipeline?.resourceRefs) {
          for (const ref of pipeline.resourceRefs) {
            // Handle validation stage
            if (
              ref.kind === Kinds.GITHUB_ADVANCED_SECURITY ||
              ref.kind === StepKey.CX_ONE ||
              ref.kind === Kinds.CX_ONE_PROJECT
            ) {
              this.isStaticSecurityChecksSetup.set(true)
              this.isValidationStageOpen.set(true)
            }

            if (ref.kind === Kinds.OPEN_SOURCE_COMPLIANCE) {
              this.isOpenSourceChecksSetup.set(true)
              this.isValidationStageOpen.set(true)
            }

            if (ref.kind === Kinds.SONAR_QUBE_PROJECT) {
              this.isStaticCodeChecksSetup.set(true)
              this.isValidationStageOpen.set(true)
            }

            // Handle errors
            if (!ref.error) {
              // There is no error => skip
              continue
            }

            if (ref.error.startsWith('PIPER-1')) {
              continue
            }

            if (ref.kind === Kinds.JENKINS_PIPELINE) {
              this.jenkinsPipelineError = true
            }

            // Needed customized error message for Freestyle Pipeline
            if (ref.kind === Kinds.FREESTYLE_PIPELINE) {
              const error = {
                title: `Configuration of CI/CD setup failed`,
                resourceName: ref.name,
                message: `<strong>Resource: </strong>${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}`,
              }
              errorMap.set(`${errorKeyPrefix}${error.message}`, error)
              continue
            }

            const error = {
              title: `Configuration of ${KindName[ref.kind]} failed`,
              resourceName: ref.name,
              message: `<strong>Resource: </strong>${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}`,
            }
            errorMap.set(`${errorKeyPrefix}${error.message}`, error)
            this.localLayout = 'OneColumnStartFullScreen'
          }

          this.errors.update((errs) => {
            errs.forEach((_, key) => {
              if (key.startsWith(errorKeyPrefix)) {
                errs.delete(key)
              }
            })
            errorMap.forEach((error, key) => {
              errs.set(key, error)
            })
            return errs
          })

          if (!this.pipelineService.isBuildPipelineSetup(pipeline.resourceRefs)) {
            this.isBuildStageSetup.set(false)
            this.isBuildStageOpen.set(false)
            return
          }

          this.isBuildStageSetup.set(true)
          this.isBuildStageOpen.set(true)

          if (!this.pipelineService.areResourcesCompletelyCreated(pipeline.resourceRefs)) {
            // some resources are not in `created` stage
            return
          }

          this.isBuildPipelineSetupAndCreated.set(true)
          // if build setup is completed, the validation section should be open as per UX
          this.isValidationStageOpen.set(true)
        }
      })
    this.loading.set(false)
  }

  private async checkSugarAppInstallation() {
    this.isSugarAppInstalled.set(
      await firstValueFrom(
        this.api.githubActionsService.getGithubActionSolinasVerification(
          this.githubMetadata.githubOrgName,
          this.githubMetadata.githubRepoUrl,
        ),
      ),
    )
  }

  ngOnDestroy(): void {
    this.pipelineSubscription.unsubscribe()
  }

  async getKubeCtlCmd(freestylePipelineName: string, namespace: string) {
    const cb = navigator.clipboard
    await cb.writeText(`kubectl describe freestylepipelines ${freestylePipelineName} -n ${namespace}`)
    this.messageToastService.open('kubectl describe command copied to clipboard', {
      duration: 5000,
    })
  }

  calculateOpenPRCount(prInfo: { title: string }[]): number {
    if (prInfo && prInfo.length > 0) {
      return prInfo.reduce((prev, curr) => {
        const title = curr.title
        if (
          title.includes('Add the piper config to your repository') ||
          title.includes('check-in config Jenkinsfile of automation step') ||
          title.includes('Hyperspace Portal: Adding GitHub Actions piper GPP workflow file') ||
          title.includes('[Hyperspace CI/CD Setup]')
        ) {
          return prev + 1
        }
        return prev
      }, 0)
    }
    return 0
  }

  async openCumulusModal(e: Event) {
    e.stopPropagation()
    await this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('cumulus-info', {
      width: '30rem',
      height: '32rem',
      title: 'Cumulus Info',
    })
  }

  getIcon(serviceName: Kinds): string {
    const extensionName = this.getExtensionClass(serviceName)
    if (extensionName) {
      return this.extensionService.getIcon(extensionName)
    }
    return ''
  }

  getExtensionClass(serviceName: string): ExtensionClass {
    const extensionName = KindExtensionName[serviceName] as string
    return this.extensionClasses().find((extensionClass) => extensionClass.name == extensionName)
  }

  openDocumentation() {
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/', '_blank', 'noopener, noreferrer')
  }

  async openSetupWizard(e: Event) {
    e.stopPropagation()
    await this.luigiClient
      .linkManager()
      .fromVirtualTreeRoot()
      .openAsModal('setup', { title: 'Set up Build Pipeline', width: '27rem', height: '33rem' })
  }

  async openGithubActionWizard(e: Event) {
    e.stopPropagation()
    await this.luigiClient
      .linkManager()
      .fromVirtualTreeRoot()
      .openAsModal('github-actions', { title: 'Enable GitHub Actions', width: '27rem', height: '19rem' })

    await this.checkSugarAppInstallation()
  }

  async openPipelineDebugModal(e: Event) {
    e.stopPropagation()
    await this.luigiClient
      .linkManager()
      .fromVirtualTreeRoot()
      .openAsModal('pipeline-debug', { size: 's', title: 'Pipeline Debug' })
  }

  openBuildStage() {
    if (this.isBuildStageSetup()) {
      this.isBuildStageOpen.set(!this.isBuildStageOpen())
    }
  }

  openValidationStage() {
    this.isValidationStageOpen.set(!this.isValidationStageOpen())
  }

  openDeployStage() {
    this.isDeployStageOpen.set(!this.isDeployStageOpen())
  }

  async getPipelineURL(pipeline: Pipeline) {
    const jenkinsStatus = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
    if (jenkinsStatus?.status !== ServiceStatus.CREATED) {
      return
    }

    const jenkinsPipeline = await firstValueFrom(this.api.jenkinsService.getJenkinsPipeline(jenkinsStatus.name))
    if (!jenkinsPipeline.jobUrl) {
      throw new Error('Jenkins jobUrl not found')
    }

    this.pipelineURL.set(jenkinsPipeline.jobUrl)
  }

  async deletePipeline(e: Event, pipeline: Pipeline) {
    e.stopPropagation()

    const componentId = (await this.luigiService.getContextAsync()).componentId

    const orchestratorKind = pipeline.resourceRefs.find((ref) =>
      ([Kinds.GITHUB_ACTIONS_PIPELINE, Kinds.JENKINS_PIPELINE] as Array<Kinds | StepKey>).includes(ref.kind),
    )?.kind

    const mb = this.messageBoxService.open(DeleteBuildModalComponent, {
      type: 'warning',
      width: '30rem',
      showSemanticIcon: true,
      data: {
        componentId,
        orchestratorKind,
      },
    })

    this.luigiDialogUtil.manageLuigiBackdrops(
      mb as MessageBoxRef<{
        componentId: string
        orchestratorKind: Kinds
      }>,
    )

    const action = (await firstValueFrom(mb.afterClosed)) as string

    if (action === 'cancel') {
      return
    }

    this.localLayout = 'OneColumnStartFullScreen'

    this.pendingDeletion.set(true)
    setTimeout(() => {
      this.pendingDeletion.set(false)
    }, 3000)

    try {
      const piperRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.PIPER_CONFIG)

      await firstValueFrom(this.api.piperService.deletePiperConfig(piperRef.name))

      if (orchestratorKind === Kinds.JENKINS_PIPELINE) {
        let jenkinsDeletionPolicy = DeletionPolicy.Orphan
        if (action === 'hard-delete') {
          jenkinsDeletionPolicy = DeletionPolicy.Delete
        }
        const jenkinsRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
        await firstValueFrom(this.api.jenkinsService.deleteJenkinsPipeline(jenkinsRef.name, jenkinsDeletionPolicy))
      } else if (orchestratorKind === Kinds.GITHUB_ACTIONS_PIPELINE) {
        const ghap = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.GITHUB_ACTIONS_PIPELINE)
        await firstValueFrom(this.api.githubActionsService.deleteGithubActionsPipeline(ghap.name))
      }
    } catch (e) {
      const errorMessage = (e as Error).message
      const error = {
        title: `Delete build stage failed`,
        resourceName: pipeline.name,
        message: `${errorMessage}`,
      }
      this.errors.update((errors) => errors.set(error.message, error))
    }
  }

  async showCredentials() {
    try {
      this.pendingShowCredentials.set(true)
      const vaultInfo = await firstValueFrom(this.api.secretService.ensureVaultOnboarding())
      window.open(vaultInfo.vaultUrl, '_blank', 'noopener, noreferrer')
    } catch (e) {
      const errorMessage = (e as Error).message
      const error = {
        title: `Show Credentials failed`,
        resourceName: undefined,
        message: `${errorMessage}`,
      }
      this.errors.update((errors) => errors.set(error.message, error))
    } finally {
      this.pendingShowCredentials.set(false)
    }
  }

  openDetails(event: Categories) {
    if (!this.activeCategory) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }

    if (this.activeCategory === event) {
      this.localLayout =
        this.localLayout === 'OneColumnStartFullScreen' ? 'TwoColumnsMidExpanded' : 'OneColumnStartFullScreen'
    }

    if (this.activeCategory !== event) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }
    this.activeCategory = event
  }

  async contactOnTransferIssues() {
    const context = await this.luigiService.getContextAsync()
    const issueURL = this.githubIssueLinkService.createIssueWithContext(
      context,
      `Transfer issue for ${context.projectId}/${context.componentId}`,
      'Pipeline is not displayed in the Hyperspace Portal.',
    )
    window.open(issueURL, '_blank', 'noopener, noreferrer')
  }

  updateLocalLayout(layoutEvent: FlexibleColumnLayout) {
    this.localLayout = layoutEvent
  }

  private async getExtensionClasses() {
    this.pendingExtensionClass.set(true)
    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.extensionClasses.set(extensionClasses)
    this.pendingExtensionClass.set(false)
  }

  protected readonly Kinds = Kinds
  protected readonly StepKey = StepKey
  protected readonly Categories = Categories
  protected readonly CategorySlotConfigService = CategorySlotConfigService
}
