import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core'
import { FlexibleColumnLayout, FundamentalNgxCoreModule, IconModule } from '@fundamental-ngx/core'
import { Observable, Subscription, firstValueFrom } from 'rxjs'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { KindCategory, KindDocumentation, KindName } from 'src/app/constants'
import { RouterModule } from '@angular/router'
import { Pipeline, ResourceRef } from 'src/app/types'
import { DeletionPolicy, Kinds, ServiceStatus } from 'src/app/enums'
import { GetGithubRepository, GithubService } from '../../services/github.service'
import { ErrorMessageComponent } from '../../components/error-message/error-message.component'
import { GetJenkinsPipeline, JenkinsService } from '../../services/jenkins.service'
import { SecretService } from '../../services/secret.service'
import { DismissibleMessageComponent } from '../../components/dismissable-message/dismissible-message.component'
import { GetPiperConfig, PiperService } from '../../services/piper.service'
import { CumulusService, GetCumulusPipeline } from '../../services/cumulus.service'
import { GetStagingServiceCredential, StagingServiceService } from '../../services/staging-service.service'
import { CumlusServiceDetailsComponent } from '../../components/service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from '../../components/service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from '../../components/service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from '../../components/service-details/piper/piper-service-details.component'
import { DebugModeService } from '../../services/debug-mode.service'
import { StagingServiceServiceDetailsComponent } from '../../components/service-details/staging-service/staging-service-service-details.component'

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
  ],
})
export class PipelineComponent implements OnInit, OnDestroy {
  @Input() pipeline$!: Observable<Pipeline>

  pipelineSubscription: Subscription

  isBuildStageOpen = signal(false)
  isBuildStageSetup = signal(false)
  isBuildPipelineSetup = signal(false)

  jenkinsPipelineError = signal(false)

  // hacky workaround solution
  pendingDeletion = signal(false)

  pendingOpenPipeline = signal(false)
  pendingShowCredentials = signal(false)

  catalogUrl = signal('')

  errors = signal<Error[]>([])

  localLayout: FlexibleColumnLayout = 'OneColumnStartFullScreen'
  activeTile: string = ''

  serviceDetailsLoading = signal(false)
  serviceDetails = signal<
    GetJenkinsPipeline & GetGithubRepository & GetCumulusPipeline & GetPiperConfig & GetStagingServiceCredential
  >({})
  serviceUrl = signal('')
  serviceCreationTimestamp = signal<Date>(null)

  //enums
  serviceStatus = ServiceStatus

  // maps
  kindName = KindName
  kindCategory = KindCategory
  kindDocumentation = KindDocumentation

  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly githubService: GithubService,
    private readonly jenkinsService: JenkinsService,
    private readonly piperService: PiperService,
    private readonly cumulusService: CumulusService,
    private readonly stagingServiceService: StagingServiceService,
    private readonly secretService: SecretService,
    private readonly luigiService: DxpLuigiContextService,
    readonly debugModeService: DebugModeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.catalogUrl.set(((await this.luigiService.getContextAsync()) as any).frameBaseUrl + '/catalog')

    this.pipelineSubscription = this.pipeline$.subscribe(async (pipeline) => {
      // error reporting
      this.errors.set([])
      this.jenkinsPipelineError.set(false)
      this.isBuildPipelineSetup.set(false)

      for (const ref of pipeline.resourceRefs) {
        if (ref.error) {
          if (ref.kind === Kinds.JENKINS_PIPELINE) {
            this.jenkinsPipelineError.set(true)
          }
          this.errors.update((errors) => {
            errors.push({
              title: `Configuration of ${KindName[ref.kind]} failed`,
              message: `Resource: ${ref.name}\nStatus: ${ref.status}\nError: ${ref.error}`,
            })
            return errors
          })
          this.localLayout = 'OneColumnStartFullScreen'
        }
      }

      // enable/disable expansion of build stage
      if (
        pipeline.resourceRefs.find((ref) => ref.kind === Kinds.JENKINS_PIPELINE) &&
        pipeline.resourceRefs.find((ref) => ref.kind === Kinds.GITHUB_REPOSITORY) &&
        pipeline.resourceRefs.find((ref) => ref.kind === Kinds.PIPER_CONFIG)
      ) {
        this.isBuildStageSetup.set(true)
        this.isBuildStageOpen.set(true)

        // is pipeline completely created
        if (pipeline.resourceRefs.every((ref) => ref.status === ServiceStatus.CREATED)) {
          this.isBuildPipelineSetup.set(true)
          await this.showFeedbackModal()
        }
      } else {
        this.isBuildStageSetup.set(false)
        this.isBuildStageOpen.set(false)
      }
    })
  }

  ngOnDestroy(): void {
    this.pipelineSubscription.unsubscribe()
  }

  async showFeedbackModal() {
    /**
     * TODO: This logic shows the feedback modal once to EVERY user viewing a fully setup pipeline.
     * It would be better to show it only to the user who set up the pipeline initially.
     * I'd say for the pilot the current behaivour is fine but for productive use we need to find a better solution
     * which might require to storing things permanently using the backend.
     */
    /**
     * FIXME: Sometimes it is not possible to close the feedback modal.
     * Luigi says: There is no target origin set. You can specify the target origin by calling LuigiClient.setTargetOrigin("targetorigin") in your micro frontend.
     * And I don't know why yet :,(
     */

    const context = await this.luigiService.getContextAsync()
    const localStorageKey = `feedback modal - ${context.projectId}/${context.componentId}`

    const item = await this.luigiClient.storageManager().getItem(localStorageKey)
    if (!item) {
      this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('feedback', {
        size: 's',
        title: 'Provide your Feedback',
        width: '25rem',
        height: '28rem',
      })
    }
    await this.luigiClient.storageManager().setItem(localStorageKey, `shown at: ${new Date()}`)
  }

  openFeedbackSurvey() {
    // TODO: get correct survey links
    window.open('https://preview.userzoom.com/s/tti.aspx?s=C883S8286&sid=1', '_blank')
  }

  openDocumentation() {
    // TODO: get correct documentation link
    alert('TODO This button should open some documentation')
  }

  openSetupWizard(e: Event) {
    e.stopPropagation()
    this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('setup', { size: 's', title: 'Setup Build' })
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

  async openPipeline(e: Event, pipeline: Pipeline) {
    if (e) {
      e.stopPropagation()
    }
    this.pendingOpenPipeline.set(true)
    let jenkinsStatus: ResourceRef = {}
    try {
      jenkinsStatus = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
      const jenkinsPipeline = await firstValueFrom(this.jenkinsService.getJenkinsPipeline(jenkinsStatus.name))
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

    this.localLayout = 'OneColumnStartFullScreen'
    this.activeTile = ''

    const githubRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.GITHUB_REPOSITORY)
    const jenkinsRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.JENKINS_PIPELINE)
    const piperRef = pipeline.resourceRefs.find((ref) => ref.kind == Kinds.PIPER_CONFIG)

    // TODO: build proper deletion
    this.pendingDeletion.set(true)
    setTimeout(() => {
      this.pendingDeletion.set(false)
    }, 3000)

    try {
      await Promise.all([
        firstValueFrom(this.githubService.deleteGithubRepository(githubRef.name)),
        firstValueFrom(this.jenkinsService.deleteJenkinsPipeline(jenkinsRef.name, DeletionPolicy.DELETE)),
        firstValueFrom(this.piperService.deletePiperConfig(piperRef.name)),
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

  expandDetails() {
    this.localLayout = 'OneColumnMidFullScreen'
  }

  shrinkDetails() {
    this.localLayout = 'TwoColumnsMidExpanded'
  }

  async retryService(e: Event, resourceRef: ResourceRef) {
    if (e) {
      e.stopPropagation()
    }
    await firstValueFrom(this.debugModeService.forceDebugReconciliation(resourceRef.kind, resourceRef.name))
  }

  closeDetails() {
    this.localLayout = 'OneColumnStartFullScreen'
    this.activeTile = ''
  }

  async showCredentials() {
    this.pendingShowCredentials.set(true)
    try {
      const vaultInfo = await firstValueFrom(this.secretService.ensureVaultOnboarding())
      window.open(vaultInfo.vaultUrl, '_blank')
      this.pendingShowCredentials.set(false)
    } catch (e) {
      this.errors.update((errors) => {
        errors.push({
          title: `Show Credentials failed`,
          message: `${e.message}`,
        })
        return errors
      })
      this.pendingShowCredentials.set(false)
    }
  }

  async openDetails(kind: Kinds, name: string, status: ServiceStatus) {
    if (status != ServiceStatus.CREATED) {
      return
    }

    this.loadDetails(kind, name)

    if (!this.activeTile) {
      this.localLayout = 'TwoColumnsMidExpanded'
      this.activeTile = kind
      return
    }
    if (this.activeTile == kind) {
      this.localLayout =
        this.localLayout == 'OneColumnStartFullScreen' ? 'TwoColumnsMidExpanded' : 'OneColumnStartFullScreen'
    }
    if (this.activeTile != kind) {
      this.localLayout = 'TwoColumnsMidExpanded'
    }
    this.activeTile = kind
  }

  async loadDetails(kind: Kinds, name: string) {
    this.serviceDetailsLoading.set(true)

    this.serviceDetails.set({})
    this.serviceUrl.set('')
    this.serviceCreationTimestamp.set(null)

    try {
      switch (kind) {
        case Kinds.JENKINS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.jenkinsService.getJenkinsPipeline(name)))
          this.serviceUrl.set(this.serviceDetails().jobUrl)
          break
        case Kinds.GITHUB_REPOSITORY:
          this.serviceDetails.set(await firstValueFrom(this.githubService.getGithubRepository(name)))
          this.serviceUrl.set(this.serviceDetails().repositoryUrl)
          break
        case Kinds.CUMULUS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.cumulusService.getCumulusPipeline(name)))
          break
        case Kinds.PIPER_CONFIG:
          this.serviceDetails.set(await firstValueFrom(this.piperService.getPiperConfig(name)))
          this.serviceUrl.set(this.serviceDetails().pullRequestURL)
          break
        case Kinds.STAGING_SERVICE_CREDENTIAL:
          this.serviceDetails.set(await firstValueFrom(this.stagingServiceService.getStagingServiceCredential()))
          break
      }

      this.serviceCreationTimestamp.set(new Date(this.serviceDetails().creationTimestamp))
    } catch (e) {
      this.errors.update((errors) => {
        errors.push({
          title: `Load service details failed for kind ${kind}`,
          message: `${e.message}`,
        })
        return errors
      })
    }

    this.serviceDetailsLoading.set(false)
  }

  openService() {
    window.open(this.serviceUrl(), '_blank')
  }

  formatDate(date: Date) {
    const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' })
    return dateFormatter.format(date)
  }
}
