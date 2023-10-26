import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core'
import { FlexibleColumnLayout, FundamentalNgxCoreModule, IconModule, MessageBoxService } from '@fundamental-ngx/core'
import { firstValueFrom, map, Observable, Subscription } from 'rxjs'
import { DxpLuigiContextService, LuigiClient, LuigiDialogUtil } from '@dxp/ngx-core/luigi'
import { KindExtensionName, KindName } from 'src/app/constants'
import { RouterModule } from '@angular/router'
import { Pipeline, ResourceRef } from 'src/app/types'
import { DeletionPolicy, Kinds, ServiceStatus } from 'src/app/enums'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { DismissibleMessageComponent } from '../../components/dismissable-message/dismissible-message.component'
import { CumlusServiceDetailsComponent } from '../../components/service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from '../../components/service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from '../../components/service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from '../../components/service-details/piper/piper-service-details.component'
import { DebugModeService } from '../../services/debug-mode.service'
import { StagingServiceServiceDetailsComponent } from '../../components/service-details/staging-service/staging-service-service-details.component'
import { DeleteBuildModal } from '../../components/delete-build-modal/delete-build-modal.component'
import { APIService } from '../../services/api.service'
import { ExtensionService } from '../../services/extension.service'
import { ExtensionClass } from '../../services/extension.types'
import { DxpContext } from '@dxp/ngx-core/common'
import { GithubActionsServiceDetailsComponent } from '../../components/service-details/github-actions/github-actions-service-details.component'
import { ServiceDetailsSkeletonComponent } from '../../components/service-details-skeleton/service-details-skeleton.component'
import { SharedDataService } from '../../services/shared-data.service'
import { ServiceData, ServiceListItemComponent } from '../../components/service-list-item/service-list-item.component'
import { GithubMetadata } from '../../services/github.service'
import { CheckGithubActionsEnablementPayload } from '../../../../generated/graphql'

type Error = {
  title: string
  message: string
}

@Component({
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
    DeleteBuildModal,
    GithubActionsServiceDetailsComponent,
    ServiceDetailsSkeletonComponent,
    ServiceListItemComponent,
  ],
})
export class PipelineComponent implements OnInit, OnDestroy {
  @Input() pipeline$!: Observable<Pipeline>
  isGithubActionsEnabledAlready$!: Observable<CheckGithubActionsEnablementPayload>
  dxpContext$: Observable<DxpContext>
  isBuildStageOpen = signal(false)
  isBuildStageSetup = signal(false)
  isBuildPipelineSetup = signal(false)
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

  localLayout: FlexibleColumnLayout = 'OneColumnStartFullScreen'
  activeTile: string = ''
  githubMetadata: GithubMetadata
  projectId: string
  // maps
  kindName = KindName
  kinds = Kinds

  private pipelineSubscription: Subscription
  private githubActionsSubscription: Subscription
  private jenkinsPipelineError = false

  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly api: APIService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly extensionService: ExtensionService,
    private readonly messageBoxService: MessageBoxService,
    private readonly luigiDialogUtil: LuigiDialogUtil,
    readonly debugModeService: DebugModeService,
    private readonly sharedResourceDataService: SharedDataService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.dxpContext$ = this.luigiService.contextObservable().pipe(map((value) => value.context))
    this.githubMetadata = await this.api.githubService.getGithubMetadata()

    const context = (await this.luigiService.getContextAsync()) as any
    this.catalogUrl.set(context.frameBaseUrl + '/catalog')
    this.projectId = context.projectId
    await this.getExtensionClasses()

    this.isGithubActionsEnabledAlready$ = this.api.githubActionsService.checkGithubActionsEnablement(
      this.githubMetadata.githubInstance,
      this.githubMetadata.githubOrgName,
    )

    this.pipelineSubscription = this.pipeline$.subscribe(async (pipeline) => {
      // error reporting
      this.errors.set([])
      this.openPRCount.set(0)
      this.isBuildPipelineSetup.set(false)
      this.jenkinsPipelineError = false
      // if true then it means that the Github Actions is enabled from the same component
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
              message: `The GitHub Actions configuration may have failed due to an expired token.<br>Please ensure that the GitHub Actions credential stored in the vault is valid.<br><strong>Resource:</strong> ${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}.`,
            })
            return errors
          })
          continue
        }
        this.errors.update((errors) => {
          errors.push({
            title: `Configuration of ${KindName[ref.kind]} failed`,
            message: `<strong>Resource: </strong>${ref.name}<br><strong>Status:</strong> ${ref.status}<br><strong>Error: </strong> ${ref.error}`,
          })
          return errors
        })
        this.localLayout = 'OneColumnStartFullScreen'
      }

      // enable/disable expansion of build stage
      const requiredKindsInBuildStage = [Kinds.JENKINS_PIPELINE, Kinds.GITHUB_REPOSITORY, Kinds.PIPER_CONFIG]
      const isRequiredKindMissingInBuildStage = requiredKindsInBuildStage.some((kind) => {
        return pipeline.resourceRefs.every((ref) => ref.kind !== kind)
      })

      if (isRequiredKindMissingInBuildStage) {
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

      await this.getPipelineURL(pipeline)
      this.openPRCount.set(await this.getOpenPRCount())
    })
  }

  private async getExtensionClasses() {
    this.pendingExtensionClass.set(true)
    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.extensionClasses.set(extensionClasses)
    this.pendingExtensionClass.set(false)
  }

  ngOnDestroy(): void {
    this.pipelineSubscription.unsubscribe()
    this.githubActionsSubscription.unsubscribe()
  }

  get showOpenPipelineURL(): boolean {
    return this.isBuildStageSetup() && !this.pendingDeletion() && !this.jenkinsPipelineError
  }

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

    const pulls = (await pullsResp.json()) as any[]
    return pulls.reduce((prev, curr) => {
      if (curr.head?.ref === 'hyperspace-jenkinsfile' || curr.head?.ref === 'piper-onboarding') {
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

  getIcon(serviceName: Kinds): string {
    const extensionName = this.getExtensionClass(serviceName)
    if (extensionName) {
      return this.extensionService.getIcon(extensionName)
    }
    return ''
  }

  getExtensionClass(serviceName: string): ExtensionClass {
    const extensionName = KindExtensionName[serviceName]
    return this.extensionClasses().find((extensionClass) => extensionClass.name == extensionName)
  }

  openDocumentation() {
    window.open('https://pages.github.tools.sap/hyper-pipe/portal-jenkins-pilot-docs/', '_blank')
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
      .openAsModal('github-actions', { title: 'Enable Github Actions', width: '38rem', height: '28rem' })
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

  pipelineURL = signal('')

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
      this.errors.update((errors) => {
        errors.push({
          title: `Open Pipeline failed`,
          message: `${e.message}\nJenkins status: ${JSON.stringify(jenkinsStatus)}`,
        })
        return errors
      })
      this.pendingOpenPipeline.set(false)
    }
  }

  async deletePipeline(e: Event, pipeline: Pipeline) {
    e.stopPropagation()

    const componentId = (await this.luigiService.getContextAsync()).componentId

    const mb = this.messageBoxService.open(DeleteBuildModal, {
      type: 'warning',
      width: '30rem',
      showSemanticIcon: true,
      data: {
        componentId,
      },
    })

    this.luigiDialogUtil.manageLuigiBackdrops(mb as any)

    const action = await firstValueFrom(mb.afterClosed)

    if (action === 'cancel') {
      return
    }

    let jenkinsDeletionPolicy = DeletionPolicy.ORPHAN
    if (action === 'hard-delete') {
      jenkinsDeletionPolicy = DeletionPolicy.DELETE
    }

    this.localLayout = 'OneColumnStartFullScreen'
    this.activeTile = ''

    const githubRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.GITHUB_REPOSITORY)
    const jenkinsRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
    const piperRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.PIPER_CONFIG)

    this.pendingDeletion.set(true)
    setTimeout(() => {
      this.pendingDeletion.set(false)
    }, 3000)

    try {
      await Promise.all([
        firstValueFrom(this.api.githubService.deleteGithubRepository(githubRef.name)),
        firstValueFrom(this.api.jenkinsService.deleteJenkinsPipeline(jenkinsRef.name, jenkinsDeletionPolicy)),
        firstValueFrom(this.api.piperService.deletePiperConfig(piperRef.name)),
      ])
    } catch (e) {
      this.errors.update((errors) => {
        errors.push({
          title: `Delete build stage failed`,
          message: `${e.message}`,
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
      this.errors.update((errors) => {
        errors.push({
          title: `Show Credentials failed`,
          message: `${e.message}`,
        })
        return errors
      })
    } finally {
      this.pendingShowCredentials.set(false)
    }
  }

  async openDetails(event: ServiceData) {
    if (event.status != ServiceStatus.CREATED) {
      return
    }

    this.sharedResourceDataService.publishResourceData(event.kind, event.name)

    if (!this.activeTile) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }

    if (this.activeTile == event.kind) {
      this.localLayout =
        this.localLayout == 'OneColumnStartFullScreen' ? 'TwoColumnsMidExpanded' : 'OneColumnStartFullScreen'
    }

    if (this.activeTile != event.kind) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }

    this.activeTile = event.kind
  }

  updateLocalLayout(layoutEvent: FlexibleColumnLayout) {
    this.localLayout = layoutEvent
  }

  // This is true when the Github Actions is enabled from one of the other components of the same project
  isGithubActionsEnabledInSameProject(responsibleProjectName: string): boolean {
    return this.projectId === responsibleProjectName
  }
}
