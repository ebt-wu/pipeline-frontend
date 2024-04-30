import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit, signal, ChangeDetectionStrategy } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DxpLuigiContextService, LuigiClient, LuigiDialogUtil } from '@dxp/ngx-core/luigi'
import { Categories, DeletionPolicy, Kinds, ServiceStatus, Stages } from '@enums'
import {
  FlexibleColumnLayout,
  FundamentalNgxCoreModule,
  IconModule,
  MessageBoxRef,
  MessageBoxService,
  MessageToastService,
} from '@fundamental-ngx/core'
import { GithubActionsGetPayload } from '@generated/graphql'
import { firstValueFrom, map, Observable, Subscription, tap } from 'rxjs'
import { KindExtensionName, KindName } from '@constants'
import { Pipeline, ResourceRef } from '@types'
import { DeleteBuildModalComponent } from '../../components/delete-build-modal/delete-build-modal.component'
import { DismissibleMessageComponent } from '../../components/dismissible-message/dismissible-message.component'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { ServiceDetailsSkeletonComponent } from '../../components/service-details-skeleton/service-details-skeleton.component'
import { CumlusServiceDetailsComponent } from '../../components/service-details/cumulus/cumulus-service-details.component'
import { GithubActionsServiceDetailsComponent } from '../../components/service-details/github-actions/github-actions-service-details.component'
import { GithubServiceDetailsComponent } from '../../components/service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from '../../components/service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from '../../components/service-details/piper/piper-service-details.component'
import { StagingServiceServiceDetailsComponent } from '../../components/service-details/staging-service/staging-service-service-details.component'
import { ServiceData, ServiceListItemComponent } from '../../components/service-list-item/service-list-item.component'
import { UpgradeBannerComponent } from '../../components/upgrade-banner/upgrade-banner.component'
import { APIService } from '../../services/api.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { ExtensionService } from '../../services/extension.service'
import { ExtensionClass } from '../../services/extension.types'
import { FeatureFlagService } from '../../services/feature-flag.service'
import { GithubMetadata } from '../../services/github.service'
import { SharedDataService } from '../../services/shared-data.service'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { ResourceStagePipe } from '../../pipes/resource-stage.pipe'
import { SetupServiceListItemComponent } from '../../components/setup-service-list-item/setup-service-list-item.component'
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageTitleComponent,
} from '@fundamental-ngx/platform'

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
  styleUrls: ['./pipeline.component.css'],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    RouterModule,
    IconModule,
    ErrorMessageComponent,
    DismissibleMessageComponent,
    CumlusServiceDetailsComponent,
    GithubServiceDetailsComponent,
    JenkinServiceDetailsComponent,
    PiperServiceDetailsComponent,
    StagingServiceServiceDetailsComponent,
    DeleteBuildModalComponent,
    GithubActionsServiceDetailsComponent,
    ServiceDetailsSkeletonComponent,
    ServiceListItemComponent,
    UpgradeBannerComponent,
    AuthorizationModule,
    ResourceStagePipe,
    SetupServiceListItemComponent,
    DynamicPageTitleComponent,
    DynamicPageHeaderComponent,
    DynamicPageComponent,
    DynamicPageContentComponent,
    DynamicPageGlobalActionsComponent,
  ],
})
export class PipelineComponent implements OnInit, OnDestroy {
  @Input() pipeline$!: Observable<Pipeline>
  isGithubActionsEnabledAlready$!: Observable<GithubActionsGetPayload>

  isBuildStageOpen = signal(false)
  isBuildStageSetup = signal(false)
  isBuildPipelineSetup = signal(false)

  isStaticSecurityChecksSetup = signal(false)
  isStaticCodeChecksSetup = signal(false)
  isOpenSourceChecksSetup = signal(false)

  isValidationStageOpen = signal(false)
  isGithubActionsEnabledInSameComponent = signal(false)
  // hacky workaround solution
  pendingDeletion = signal(false)
  pendingOpenPipeline = signal(false)
  pendingShowCredentials = signal(false)
  pendingExtensionClass = signal(false)
  catalogUrl = signal('')
  errors = signal<Error[]>([])
  extensionClasses = signal<ExtensionClass[]>([])
  openPRCount = signal(0)

  // Feature flags
  showGithubActions = signal(false)
  showGHAS = signal(false)

  localLayout: FlexibleColumnLayout = 'OneColumnStartFullScreen'
  activeTile: string = ''
  githubMetadata: GithubMetadata
  projectId: string
  // maps
  kindName = KindName
  kinds = Kinds
  serviceStatus = ServiceStatus
  categories = Categories
  stages = Stages
  pipelineURL = signal('')
  private pipelineSubscription: Subscription
  private githubActionsSubscription: Subscription
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
    private readonly sharedResourceDataService: SharedDataService,
  ) {}

  get showOpenPipelineURL(): boolean {
    return this.isBuildStageSetup() && !this.pendingDeletion() && !this.jenkinsPipelineError
  }

  async ngOnInit(): Promise<void> {
    await this.getExtensionClasses()

    this.githubMetadata = await this.api.githubService.getGithubMetadata()

    const context = await this.luigiService.getContextAsync()

    // Only show GHA and GHAS if their feature flags are toggled on
    this.showGithubActions.set(await this.featureFlagService.isGithubActionsEnabled(context.projectId))
    this.showGHAS.set(await this.featureFlagService.isGhasEnabled(context.projectId))

    this.catalogUrl.set(context.frameBaseUrl + '/catalog')
    this.projectId = context.projectId

    this.isGithubActionsEnabledAlready$ = this.api.githubActionsService.getGithubActionsCrossNamespace(
      this.githubMetadata.githubInstance,
      this.githubMetadata.githubOrgName,
    )

    this.pipelineSubscription = this.pipeline$
      .pipe(
        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        tap(async (pipeline) => {
          await this.getPipelineURL(pipeline)
          this.openPRCount.set(await this.getOpenPRCount())
        }),
      )
      .subscribe((pipeline: Pipeline) => {
        // error reporting
        this.errors.set([])
        this.openPRCount.set(0)
        this.isBuildPipelineSetup.set(false)
        this.jenkinsPipelineError = false
        if (pipeline?.resourceRefs) {
          // if true then it means that the GitHub Actions is enabled from the same component
          this.isGithubActionsEnabledInSameComponent.set(
            pipeline.resourceRefs.some((ref) => ref.kind === Kinds.GITHUB_ACTION),
          )

          for (const ref of pipeline.resourceRefs) {
            if (!ref.error) {
              continue
            }

            if (ref.error.startsWith('PIPER-1')) {
              continue
            }

            if (ref.kind === Kinds.JENKINS_PIPELINE) {
              this.jenkinsPipelineError = true
            }
            // Needed customized error message for GitHub Actions
            if (ref.kind === Kinds.GITHUB_ACTION) {
              this.errors.update((errors) => {
                errors.push({
                  title: `Configuration of ${KindName[ref.kind]} failed`,
                  resourceName: ref.name,
                  message: `The GitHub Actions configuration may have failed due to an expired token.<br>Please ensure that the GitHub credential stored in the vault is valid.<br><strong>Resource:</strong> ${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}.`,
                })
                return errors
              })
              continue
            }
            this.errors.update((errors) => {
              errors.push({
                title: `Configuration of ${KindName[ref.kind]} failed`,
                resourceName: ref.name,
                message: `<strong>Resource: </strong>${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}`,
              })
              return errors
            })
            this.localLayout = 'OneColumnStartFullScreen'
          }

          // enable/disable expansion of build stage
          const requiredKindsInBuildStage = [Kinds.GITHUB_REPOSITORY, Kinds.PIPER_CONFIG]
          const isRequiredKindMissingInBuildStage = requiredKindsInBuildStage.some((kind) => {
            return pipeline.resourceRefs.every((ref) => ref.kind !== kind)
          })

          const orchestrators = [Kinds.JENKINS_PIPELINE, Kinds.GITHUB_ACTIONS_WORKFLOW]
          const isOrchestratorMissingInBuildStage = !pipeline.resourceRefs.find((ref) =>
            orchestrators.find((value) => ref.kind === value),
          )

          if (
            pipeline.resourceRefs.find(
              (ref) => ref.kind === Kinds.GITHUB_ADVANCED_SECURITY || ref.kind === Kinds.CX_ONE,
            )
          ) {
            this.isStaticSecurityChecksSetup.set(true)
            this.isValidationStageOpen.set(true)
          } else {
            this.isStaticSecurityChecksSetup.set(false)
          }

          if (isRequiredKindMissingInBuildStage || isOrchestratorMissingInBuildStage) {
            this.isBuildStageSetup.set(false)
            this.isBuildStageOpen.set(false)
            return
          }

          this.isBuildStageSetup.set(true)
          this.isBuildStageOpen.set(true)

          // is pipeline completely created?
          if (pipeline.resourceRefs.some((ref) => ref.status !== ServiceStatus.CREATED)) {
            return
          }

          this.isBuildPipelineSetup.set(true)
          // if build setup is completed, the validation section should be open as per UX
          this.isValidationStageOpen.set(true)
        }
      })
  }

  ngOnDestroy(): void {
    this.pipelineSubscription.unsubscribe()
    this.githubActionsSubscription.unsubscribe()
  }

  async getKubeCtlCmd(freestylePipelineName: string, namespace: string) {
    const cb = navigator.clipboard
    await cb.writeText(`kubectl describe freestylepipelines ${freestylePipelineName} -n ${namespace}`)
    this.messageToastService.open('kubectl describe command copied to clipboard', {
      duration: 5000,
    })
  }
  // eslint-disable
  async getOpenPRCount(): Promise<number> {
    const token = await firstValueFrom(
      this.luigiService.contextObservable().pipe(
        map((luigiContext) => {
          if (!luigiContext.context?.githubToolsToken) {
            this.luigiClient.sendCustomMessage({
              id: `token.request.github.tools.sap`,
            })
            return {}
          }

          return {
            value: luigiContext.context.githubToolsToken as string,
            domain: 'github.tools.sap',
          }
        }),
      ),
    )

    if (!token?.value || !this.githubMetadata.githubRepoUrl) {
      return 0
    }

    const url = new URL(this.githubMetadata.githubRepoUrl)
    const pullsResp = await fetch(`${this.githubMetadata.githubInstance}/api/v3/repos${url.pathname}/pulls`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    const pulls = (await pullsResp.json()) as { head: { ref: string } }[]
    return pulls.reduce((prev, curr) => {
      const ref = curr.head?.ref
      if (ref === 'hyperspace-jenkinsfile' || ref === 'piper-onboarding' || ref === 'hyperspace-github-actions') {
        return prev + 1
      }
      return prev
    }, 0)
  }

  openFeedback() {
    window.open(
      'https://sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com/site#feedbackservice-Display&/topic/cc5045ed-6c4e-4e7b-a18d-a0b377faf593/createFeedback',
      '_blank',
    )
  }
  openCumulusModal(e: Event) {
    e.stopPropagation()
    this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('cumulus-info', {
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
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/', '_blank')
  }

  openSetupWizard(e: Event) {
    e.stopPropagation()
    this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('setup', { size: 's', title: 'Set up Build' })
  }

  openGithubActionWizard(e: Event) {
    e.stopPropagation()
    this.luigiClient
      .linkManager()
      .fromVirtualTreeRoot()
      .openAsModal('github-actions', { title: 'Enable GitHub Actions', width: '38rem', height: '30rem' })
  }

  openPipelineDebugModal(e: Event) {
    e.stopPropagation()
    this.luigiClient
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

  async openPipeline(e: Event, pipeline: Pipeline) {
    if (e) {
      e.stopPropagation()
    }
    this.pendingOpenPipeline.set(true)
    let jenkinsStatus: ResourceRef = {}
    try {
      jenkinsStatus = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
      const jenkinsPipeline = await firstValueFrom(this.api.jenkinsService.getJenkinsPipeline(jenkinsStatus.name))
      if (!jenkinsPipeline.jobUrl) {
        throw new Error('Jenkins jobUrl not found')
      }
      window.open(jenkinsPipeline.jobUrl, '_blank')
      this.pendingOpenPipeline.set(false)
    } catch (e) {
      const errorMessage = (e as Error).message
      this.errors.update((errors) => {
        errors.push({
          title: `Open Pipeline failed`,
          resourceName: pipeline.name,
          message: `${errorMessage}\nJenkins status: ${JSON.stringify(jenkinsStatus)}`,
        })
        return errors
      })
      this.pendingOpenPipeline.set(false)
    }
  }

  async deletePipeline(e: Event, pipeline: Pipeline) {
    e.stopPropagation()

    const componentId = (await this.luigiService.getContextAsync()).componentId

    const orchestratorKind = pipeline.resourceRefs.find((ref) =>
      [Kinds.GITHUB_ACTIONS_WORKFLOW, Kinds.JENKINS_PIPELINE].includes(ref.kind),
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

    this.luigiDialogUtil.manageLuigiBackdrops(mb as MessageBoxRef<{ componentId: string; orchestratorKind: Kinds }>)

    const action = (await firstValueFrom(mb.afterClosed)) as string

    if (action === 'cancel') {
      return
    }

    this.localLayout = 'OneColumnStartFullScreen'
    this.activeTile = ''

    this.pendingDeletion.set(true)
    setTimeout(() => {
      this.pendingDeletion.set(false)
    }, 3000)

    try {
      const githubRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.GITHUB_REPOSITORY)
      const piperRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.PIPER_CONFIG)

      await firstValueFrom(this.api.piperService.deletePiperConfig(piperRef.name))
      await firstValueFrom(this.api.githubService.deleteGithubRepository(githubRef.name))

      if (orchestratorKind === Kinds.JENKINS_PIPELINE) {
        let jenkinsDeletionPolicy = DeletionPolicy.ORPHAN
        if (action === 'hard-delete') {
          jenkinsDeletionPolicy = DeletionPolicy.DELETE
        }
        const jenkinsRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
        await firstValueFrom(this.api.jenkinsService.deleteJenkinsPipeline(jenkinsRef.name, jenkinsDeletionPolicy))
      }
    } catch (e) {
      const errorMessage = (e as Error).message
      this.errors.update((errors) => {
        errors.push({
          title: `Delete build stage failed`,
          resourceName: pipeline.name,
          message: `${errorMessage}`,
        })
        return errors
      })
    }
  }

  async showCredentials() {
    try {
      this.pendingShowCredentials.set(true)
      const vaultInfo = await firstValueFrom(this.api.secretService.ensureVaultOnboarding())
      window.open(vaultInfo.vaultUrl, '_blank')
    } catch (e) {
      const errorMessage = (e as Error).message
      this.errors.update((errors) => {
        errors.push({
          title: `Show Credentials failed`,
          resourceName: undefined,
          message: `${errorMessage}`,
        })
        return errors
      })
    } finally {
      this.pendingShowCredentials.set(false)
    }
  }

  openDetails(event: ServiceData) {
    if (event.status != ServiceStatus.CREATED.toString()) {
      return
    }

    // Need to check GitHub Action status separately since no event status is given (pipeline.component.html:186)
    if (event.kind === Kinds.GITHUB_ACTION && event.pipeline) {
      for (let i = 0; i < event.pipeline?.resourceRefs?.length; i++) {
        const ref = event.pipeline?.resourceRefs[i]
        if (ref.kind === Kinds.GITHUB_ACTION && ref.status != ServiceStatus.CREATED) {
          return
        }
      }
    }

    this.sharedResourceDataService.publishResourceData(event.kind, event.name)

    if (!this.activeTile) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }

    if (this.activeTile === event.kind.toString()) {
      this.localLayout =
        this.localLayout === 'OneColumnStartFullScreen' ? 'TwoColumnsMidExpanded' : 'OneColumnStartFullScreen'
    }

    if (this.activeTile !== event.kind.toString()) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }

    this.activeTile = event.kind
  }

  updateLocalLayout(layoutEvent: FlexibleColumnLayout) {
    this.localLayout = layoutEvent
  }

  // This is true when the GitHub Actions is enabled from one of the other components of the same project
  isGithubActionsEnabledInSameProject(responsibleProjectName: string): boolean {
    return this.projectId === responsibleProjectName
  }

  private async getExtensionClasses() {
    this.pendingExtensionClass.set(true)
    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.extensionClasses.set(extensionClasses)
    this.pendingExtensionClass.set(false)
  }
}
