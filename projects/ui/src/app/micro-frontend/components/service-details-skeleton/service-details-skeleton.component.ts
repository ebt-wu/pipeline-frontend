import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ApolloError } from '@apollo/client/core'
import { KindCategory, KindExtensionName, KindName, NotManagedServices, OrderedStepsByCategory } from '@constants'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { DxpContext } from '@dxp/ngx-core/common'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { Categories, Kinds, ServiceStatus, StepKey } from '@enums'
import { ColorAccent, FlexibleColumnLayout, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import {
  IconTabBarComponent,
  IconTabBarTabComponent,
  MenuComponent,
  MenuTriggerDirective,
  PlatformMenuButtonModule,
} from '@fundamental-ngx/platform'
import {
  GithubRepository,
  JenkinsPipeline,
  OpenSourceComplianceGetResponse,
  PiperConfig,
  SonarQubeProject,
} from '@generated/graphql'
import { ErrorMessage, Pipeline, ResourceRef, ServiceDetails } from '@types'
import { firstValueFrom, map, Observable } from 'rxjs'
import { APIService } from '../../services/api.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { ExtensionService } from '../../services/extension.service'
import { ExtensionClass, ServiceLevel } from '../../services/extension.types'
import { GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { PipelineService } from '../../services/pipeline.service'
import { PolicyService } from '../../services/policy.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { AzureServiceDetailsComponent } from '../service-details/azure/azure-service-details.component'
import { BlackDuckServiceDetailsComponent } from '../service-details/black-duck/black-duck-service-details.component'
import { CheckmarxServiceDetailsComponent } from '../service-details/checkmarx/checkmarx-service-details.component'
import { CloudFoundryServiceDetailsComponent } from '../service-details/cloud-foundry/cloud-foundry-service-details.component'
import { CnbServiceDetailsComponent } from '../service-details/cnb/cnb-service-details.component'
import { CommonRepositoryServiceDetailsComponent } from '../service-details/commonrepository/common-repository-service-details.component'
import { CumlusServiceDetailsComponent } from '../service-details/cumulus/cumulus-service-details.component'
import { CXOneServiceDetailsComponent } from '../service-details/cx-one/cx-one-service-details.component'
import { CxOneProjectServiceDetailsComponent } from '../service-details/cx-one-project/cx-one-project-service-details.component'
import { FortifyServiceDetailsComponent } from '../service-details/fortify/fortify-service-details.component'
import { GithubServiceDetailsComponent } from '../service-details/github/github-service-details.component'
import { GithubActionsServiceDetailsComponent } from '../service-details/github-actions/github-actions-service-details.component'
import { GithubAdvancedSecurityServiceDetailsComponent } from '../service-details/github-advanced-security/github-advanced-security-service-details.component'
import { JenkinServiceDetailsComponent } from '../service-details/jenkins/jenkins-service-details.component'
import { KubernetesServiceDetailsComponent } from '../service-details/kubernetes/kubernetes-service-details.component'
import { OpenSourceComplianceDetailsComponent } from '../service-details/open-source-compliance/open-source-compliance-details.component'
import { PiperServiceDetailsComponent } from '../service-details/piper/piper-service-details.component'
import { PpmsFossServiceDetailsComponent } from '../service-details/ppms-foss/ppms-foss-service-details.component'
import { SonarServiceDetailsComponent } from '../service-details/sonar/sonar-service-details.component'
import { StagingServiceServiceDetailsComponent } from '../service-details/staging-service/staging-service-service-details.component'
import { WhiteSourceServiceDetailsComponent } from '../service-details/whitesource/whitesource-service-details.component'
import { XMakeServiceDetailsComponent } from '../service-details/xmake/xmake-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-service-details-skeleton',
  templateUrl: './service-details-skeleton.component.html',
  standalone: true,
  styleUrl: './service-details-skeleton.component.css',
  imports: [
    AuthorizationModule,
    CommonModule,
    FundamentalNgxCoreModule,
    CumlusServiceDetailsComponent,
    GithubServiceDetailsComponent,
    JenkinServiceDetailsComponent,
    PiperServiceDetailsComponent,
    StagingServiceServiceDetailsComponent,
    GithubActionsServiceDetailsComponent,
    OpenSourceComplianceDetailsComponent,
    AzureServiceDetailsComponent,
    XMakeServiceDetailsComponent,
    SonarServiceDetailsComponent,
    BlackDuckServiceDetailsComponent,
    CheckmarxServiceDetailsComponent,
    CxOneProjectServiceDetailsComponent,
    CXOneServiceDetailsComponent,
    CnbServiceDetailsComponent,
    FortifyServiceDetailsComponent,
    WhiteSourceServiceDetailsComponent,
    PpmsFossServiceDetailsComponent,
    CommonRepositoryServiceDetailsComponent,
    KubernetesServiceDetailsComponent,
    CloudFoundryServiceDetailsComponent,
    ErrorMessageComponent,
    GithubAdvancedSecurityServiceDetailsComponent,
    PlatformMenuButtonModule,
    MenuTriggerDirective,
    MenuComponent,
    IconTabBarComponent,
    IconTabBarTabComponent,
    FormsModule,
  ],
})
export class ServiceDetailsSkeletonComponent implements OnInit, OnChanges {
  @Input() activeCategory: Categories
  @Input() localLayout: FlexibleColumnLayout
  @Input() pipeline: Pipeline
  @Input() leanIxData: ExtensionClass[]
  @Output() readonly localLayoutEvent: EventEmitter<FlexibleColumnLayout> = new EventEmitter<FlexibleColumnLayout>()

  // maps
  kindName = KindName
  kinds = Kinds
  stepKeys = StepKey
  protected readonly ServiceStatus = ServiceStatus

  dxpContext$: Observable<DxpContext>

  servicesToShow = signal<(Kinds | StepKey)[]>([])
  serviceDetailsLoading = signal(false)
  serviceDetails = signal<Map<Kinds | StepKey, ServiceDetails>>(new Map())
  serviceUrls = signal(new Map<Kinds | StepKey, string>())
  errors = signal<Map<Kinds | StepKey, ErrorMessage[]>>(new Map())
  errorKinds = signal<(Kinds | StepKey)[]>([])
  catalogUrl = signal('')
  hasPermissions = signal(false)

  constructor(
    private readonly api: APIService,
    private readonly extensionService: ExtensionService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly luigiClient: LuigiClient,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
    private readonly pipelineService: PipelineService,
    private readonly policyService: PolicyService,
    readonly debugModeService: DebugModeService,
  ) {}

  get getPipelineId() {
    return this.pipeline?.labels?.find((label) => label.key === 'sap.hyperspace/pipeline-id')?.value
  }

  async ngOnChanges() {
    this.errorKinds.set(this.pipeline.resourceRefs.filter((ref) => ref.error).map((ref) => ref.kind))
    this.servicesToShow.set(this.findAndSortServicesFromCategory(this.activeCategory))

    this.serviceDetailsLoading.set(true)
    const serviceDetailsMap = new Map<Kinds | StepKey, ServiceDetails>()
    const serviceUrlMap = new Map<Kinds | StepKey, string>()
    for (const tile of this.servicesToShow()) {
      serviceDetailsMap.set(tile, await this.getDetails(tile))
      this.serviceDetails.set(serviceDetailsMap)
      serviceUrlMap.set(tile, await this.getServiceLink(tile))
    }
    this.serviceUrls.set(serviceUrlMap)
    this.serviceDetailsLoading.set(false)
  }

  async ngOnInit() {
    this.dxpContext$ = this.luigiService.contextObservable().pipe(map((value) => value.context))
    const context = await this.luigiService.getContextAsync()
    this.catalogUrl.set(context.frameBaseUrl + '/catalog')
    this.hasPermissions.set(await this.checkPermission())
  }

  expandDetails() {
    this.localLayout = 'OneColumnMidFullScreen'
    this.localLayoutEvent.emit(this.localLayout)
  }

  shrinkDetails() {
    this.localLayout = 'TwoColumnsMidExpanded'
    this.localLayoutEvent.emit(this.localLayout)
  }

  closeDetails() {
    this.localLayout = 'OneColumnStartFullScreen'
    this.localLayoutEvent.emit(this.localLayout)
  }

  getInstallationDate(kind: Kinds | StepKey = null): Date | null {
    if (!kind) {
      return
    }
    if (NotManagedServices.includes(kind as StepKey)) {
      return this.pipeline.notManagedServices?.pipelineCreationTimestamp
        ? new Date(this.pipeline.notManagedServices.pipelineCreationTimestamp)
        : null
    } else {
      try {
        const details: ServiceDetails = this.serviceDetails().get(kind)

        if (details && details['creationTimestamp']) {
          return new Date(details['creationTimestamp'] as string)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  async getServiceLink(kind: Kinds | StepKey): Promise<string> {
    try {
      const serviceDetailsForKind: ServiceDetails = this.serviceDetails().get(kind)
      const { githubRepoUrl } = await this.api.githubService.getGithubMetadata()

      switch (kind) {
        case Kinds.JENKINS_PIPELINE:
          return (serviceDetailsForKind as JenkinsPipeline).jobUrl

        case Kinds.GITHUB_REPOSITORY:
          return (serviceDetailsForKind as GithubRepository).repositoryUrl

        case Kinds.PIPER_CONFIG:
          return (serviceDetailsForKind as PiperConfig).pullRequestURL

        case Kinds.GITHUB_ACTIONS_ENABLEMENT:
        case Kinds.GITHUB_ACTIONS_PIPELINE: {
          return githubRepoUrl + '/actions'
        }
        case Kinds.GITHUB_ADVANCED_SECURITY:
          return githubRepoUrl

        case Kinds.OPEN_SOURCE_COMPLIANCE: {
          const oscRegistration = serviceDetailsForKind as OpenSourceComplianceGetResponse
          if (oscRegistration.jiraRef === '') {
            return githubRepoUrl + '/issues'
          } else {
            const jiraItems = await firstValueFrom(this.api.jiraService.getJiraProjects())
            const jiraItem = jiraItems.find((item) => item.resourceName === oscRegistration.jiraRef)
            return `https://${jiraItem.jiraInstanceUrl}/projects/${jiraItem.projectKey}`
          }
        }
        case Kinds.SONAR_QUBE_PROJECT:
          return `${(serviceDetailsForKind as SonarQubeProject).host}/dashboard?id=${(serviceDetailsForKind as SonarQubeProject).name}`
      }
    } catch (err) {
      const errorMessage = (err as Error).message
      this.errors.update((map) => {
        const errorMessages = map.get(kind) || []
        errorMessages.push({
          title: `Load service URL failed for kind ${kind}`,
          message: `${errorMessage}`,
        })
        map.set(kind, errorMessages)
        return map
      })
    }
  }

  serviceSetupSuccessfully(serviceKind: Kinds | StepKey): boolean {
    return !this.errorKinds().includes(serviceKind)
  }

  async getDetails(kind: Kinds | StepKey): Promise<ServiceDetails> {
    const { githubRepoUrl, githubRepoName } = await this.api.githubService.getGithubMetadata()

    const name = this.getResourceNameFromResourceRefs(kind, this.pipeline.resourceRefs)
    try {
      switch (kind) {
        case Kinds.JENKINS_PIPELINE:
          return await firstValueFrom(this.api.jenkinsService.getJenkinsPipeline(name))

        case Kinds.GITHUB_REPOSITORY:
          return await firstValueFrom(this.api.githubService.getGithubRepository(name))

        case Kinds.CUMULUS_PIPELINE:
          return await firstValueFrom(this.api.cumulusService.getCumulusPipeline(name))

        case Kinds.PIPER_CONFIG:
          return await firstValueFrom(this.api.piperService.getPiperConfig(name))

        case Kinds.STAGING_SERVICE_CREDENTIAL:
          return await firstValueFrom(this.api.stagingServiceService.getStagingServiceCredential())

        case StepKey.AZURE_DEV_OPS:
          return this.pipeline.notManagedServices[StepKey.AZURE_DEV_OPS]

        case StepKey.CNB:
          return this.pipeline.notManagedServices[StepKey.CNB]

        case StepKey.XMAKE:
          return this.pipeline.notManagedServices[StepKey.XMAKE]

        case StepKey.COMMON_REPOSITORY:
          return this.pipeline.notManagedServices[StepKey.COMMON_REPOSITORY]

        case Kinds.GITHUB_ACTIONS_ENABLEMENT:
        case Kinds.GITHUB_ACTIONS_PIPELINE:
          return this.pipeline.githubActionsDetails

        case Kinds.GITHUB_ADVANCED_SECURITY:
          return {
            ...(await firstValueFrom(this.api.githubAdvancedSecurityService.getGithubAdvancedSecurity(name))),
            githubRepoName,
            repoUrl: githubRepoUrl,
          }

        case Kinds.CX_ONE_PROJECT:
          return await firstValueFrom(this.api.cxOneService.getCxOneProject(name))

        case Kinds.OPEN_SOURCE_COMPLIANCE:
          return await firstValueFrom(this.api.openSourceComplianceService.getOpenSourceComplianceRegistration())

        case Kinds.SONAR_QUBE_PROJECT:
          return await firstValueFrom(this.api.sonarService.getSonarqubeProject(name))

        case StepKey.BLACK_DUCK_HUB:
          return this.pipeline.notManagedServices[StepKey.BLACK_DUCK_HUB]

        case StepKey.CHECKMARX:
          return this.pipeline.notManagedServices[StepKey.CHECKMARX]

        case StepKey.CX_ONE:
          return this.pipeline.notManagedServices[StepKey.CX_ONE]

        case StepKey.FORTIFY:
          return this.pipeline.notManagedServices[StepKey.FORTIFY]

        case StepKey.WHITE_SOURCE:
          return this.pipeline.notManagedServices[StepKey.WHITE_SOURCE]

        case StepKey.PPMS_FOSS:
          return this.pipeline.notManagedServices[StepKey.PPMS_FOSS]

        case StepKey.KUBERNETES:
          return this.pipeline.notManagedServices[StepKey.KUBERNETES]

        case StepKey.CLOUD_FOUNDRY:
          return this.pipeline.notManagedServices[StepKey.CLOUD_FOUNDRY]
      }
    } catch (err) {
      const errorMessage = (err as Error).message
      this.errors.update((map) => {
        const errorMessages = map.get(kind) || []
        errorMessages.push({
          title: `Load service details failed for kind ${kind}`,
          message: `${errorMessage}`,
        })
        map.set(kind, errorMessages)
        return map
      })
    }
  }

  async deleteGHAS() {
    await this.luigiClient
      .uxManager()
      .showConfirmationModal({
        header: 'Remove Static Security Checks',
        body: 'Are you sure you want to remove static security checks?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No',
      })
      .then(async () => {
        const resourceName = this.getResourceNameFromResourceRefs(
          Kinds.GITHUB_ADVANCED_SECURITY,
          this.pipeline.resourceRefs,
        )
        if (!resourceName) {
          throw new Error('GHAS resource not found')
        }
        await firstValueFrom(this.api.githubAdvancedSecurityService.deleteGithubAdvancedSecurity(resourceName))
      })
      .catch((err) => {
        const errorMessage = (err as Error).message
        this.errors.update((map) => {
          const errorMessages = map.get(Kinds.GITHUB_ADVANCED_SECURITY) || []
          errorMessages.push({
            title: 'Deleting Static Security Checks failed',
            message: errorMessage,
          })
          map.set(Kinds.GITHUB_ADVANCED_SECURITY, errorMessages)
          return map
        })
      })
  }

  openService(kind: Kinds | StepKey) {
    const link = this.serviceUrls().get(kind)
    window.open(link, '_blank', 'noopener, noreferrer')
  }

  getIcon(extension: ExtensionClass): string {
    if (extension) {
      return this.extensionService.getIcon(extension)
    }
    return ''
  }

  getResourceNameFromResourceRefs(kind: Kinds | StepKey, resourceRefs: ResourceRef[]): string {
    const resource = resourceRefs.find((ref) => ref.kind === kind)
    return resource?.name
  }

  getResourceFromResourceRefs(kind: Kinds | StepKey, resourceRefs: ResourceRef[]): ResourceRef {
    return resourceRefs.find((ref) => ref.kind === kind)
  }

  getResourceStatusFromResourceRefs(kind: Kinds | StepKey, resourceRefs: ResourceRef[]): string {
    const resource = resourceRefs.find((ref) => ref.kind === kind)
    return resource?.status
  }

  getExtensionClass(activeTile: string): ExtensionClass {
    const extensionName = KindExtensionName[activeTile] as string
    return this.leanIxData.find((extensionClass) => extensionClass.name === extensionName)
  }

  getComma(element: unknown, array: unknown[]): string {
    if (array.length - 1 === array.indexOf(element)) {
      return ''
    }
    return ', '
  }

  getMailLink(email: string): string {
    return `mailto:${email}`
  }

  getServiceLevel(level: ServiceLevel): string {
    switch (level) {
      case ServiceLevel.VeryHigh:
        return '24x7'
      case ServiceLevel.High:
        return '24x5'
      case ServiceLevel.MediumOne:
        return '16x5'
      case ServiceLevel.MediumTwo:
        return '12x5'
      case ServiceLevel.Low:
        return '8x5'
      default:
        return 'No service level maintained'
    }
  }

  missingServiceDetailsTicketUrl(kind: string, context: DxpContext): string {
    return this.githubIssueLinkService.createIssueWithContext(
      context,
      `Service info for service ${this.kindName[kind]} missing`,
      `
Service details from LeanIX are missing for the service \`${this.kindName[kind]}\
The information might be missing in the Hyperspace portal extension backend, LeanIX or there is a misconfiguration in the CI/CD setup UI.
      `,
    )
  }

  getAllErrors(): ErrorMessage[] {
    return Array.from(this.errors().values()).flat()
  }

  openGHASScannnerResults() {
    window.open(
      this.serviceUrls().get(Kinds.GITHUB_ADVANCED_SECURITY) + '/security/code-scanning',
      '_blank',
      'noopener, noreferrer',
    )
  }

  openGHASSettings() {
    window.open(
      this.serviceUrls().get(Kinds.GITHUB_ADVANCED_SECURITY) + '/settings/security_analysis/',
      '_blank',
      'noopener, noreferrer',
    )
  }

  findAndSortServicesFromCategory(category: Categories): (Kinds | StepKey)[] {
    const servicesToShow: (Kinds | StepKey)[] = []

    if (category === Categories.AUTOMATE_WORKFLOWS && this.pipeline.githubActionsDetails) {
      servicesToShow.push(Kinds.GITHUB_ACTIONS_ENABLEMENT)
    }

    const kindsStepKeys = Object.keys(KindCategory).filter((key) => KindCategory[key] === category)
    const matchingKindsStepKeys = this.pipeline.resourceRefs
      .filter((ref) => kindsStepKeys.includes(ref.kind))
      .map((ref) => ref.kind)

    if (this.pipeline.notManagedServices) {
      const matchingNotManagedServices = Object.entries(this.pipeline.notManagedServices)
        .filter(([key, value]) => {
          return kindsStepKeys.includes(key) && value !== null
        })
        .map(([key]) => key as StepKey)
      servicesToShow.push(...Array.from(new Set([...matchingKindsStepKeys, ...matchingNotManagedServices])))
    } else {
      servicesToShow.push(...matchingKindsStepKeys)
    }

    // Sort the services if there's more than 1
    if (servicesToShow.length > 1) {
      return servicesToShow.sort((a, b) => OrderedStepsByCategory[a] - OrderedStepsByCategory[b])
    }

    return servicesToShow
  }

  isServiceFailingCreation(kind: Kinds | StepKey): boolean {
    const ref = this.pipeline.resourceRefs.find((ref) => ref.kind === kind)
    return ref && ref.status === ServiceStatus.FAILING_CREATION
  }

  isServiceNotManaged(kind: Kinds | StepKey): boolean {
    return NotManagedServices.includes(kind as StepKey)
  }

  getNeutralColorAccent() {
    return 10 as ColorAccent
  }

  canUnmanagedServiceBeRemoved(serviceToCheck: Kinds | StepKey): boolean {
    if (!this.hasPermissions()) {
      return false
    }

    switch (serviceToCheck) {
      case this.stepKeys.CHECKMARX:
      case this.stepKeys.FORTIFY:
        return this.isAnyServicePresent([this.kinds.GITHUB_ADVANCED_SECURITY, this.stepKeys.CX_ONE])
      case this.stepKeys.BLACK_DUCK_HUB:
      case this.stepKeys.WHITE_SOURCE:
        return this.isAnyServicePresent([this.kinds.OPEN_SOURCE_COMPLIANCE])
      default:
        return false
    }
  }

  isAnyServicePresent(servicesToCheck: (Kinds | StepKey)[]): boolean {
    return servicesToCheck.some((service) => this.servicesToShow().includes(service))
  }

  async removeUnmanagedService(value: Kinds | StepKey): Promise<void> {
    if (isStepKey(value)) {
      await firstValueFrom(this.pipelineService.deleteNotManagedService(value))
    }
  }

  async openDialog(serviceKind: Kinds | StepKey): Promise<void> {
    await this.luigiClient
      .uxManager()
      .showConfirmationModal({
        header: `Remove ${this.kindName[serviceKind]}`,
        body: 'Please clean up existing data if you plan to remove and not use this service anymore. This includes for example products, projects, group or other service entities. More information and links are found in the service detail view.',
        buttonConfirm: 'Remove',
        buttonDismiss: 'Cancel',
      })
      .then(() => {
        this.removeUnmanagedService(serviceKind)
          .then(() => {
            this.luigiClient
              .uxManager()
              .showAlert({
                text: `${this.kindName[serviceKind]} removed`,
                type: 'success',
                closeAfter: 3000,
              })
              .catch((error) => {
                console.error('Error while showing alert', error)
              })
          })
          .catch((error) => {
            this.luigiClient
              .uxManager()
              .showAlert({
                text: `Error while removing service ${this.kindName[serviceKind]}: ${error}`,
                type: 'error',
              })
              .catch((error) => {
                console.error('Error while showing alert', error)
              })
          })
      })
  }

  async onRetryClicked(resourceRef: ResourceRef): Promise<void> {
    try {
      await firstValueFrom(this.debugModeService.forceDebugReconciliation(resourceRef.kind, resourceRef.name))
      this.debugModeService.messageToastService.open('Triggered reconciliation')
    } catch (e) {
      if (e instanceof ApolloError) {
        this.debugModeService.messageToastService.open(e.message, {
          duration: 5000,
        })
      }
    }
  }

  async onDebugClicked(resourceRef: ResourceRef): Promise<void> {
    try {
      if (!isKind(resourceRef.kind)) {
        return // We don't want to toggle debug label for StepKey
      }
      await firstValueFrom(
        this.debugModeService.toggleDebugLabel(resourceRef.kind, resourceRef.name).pipe(
          map((result) => {
            if (result.data?.toggleDebugLabel) {
              this.debugModeService.messageToastService.open(result.data?.toggleDebugLabel, {
                duration: 5000,
              })
            }
            return
          }),
        ),
      )
    } catch (error) {
      if (error instanceof ApolloError) {
        this.debugModeService.messageToastService.open(error.message, {
          duration: 5000,
        })
      }
      return
    }
  }

  async checkPermission() {
    return await this.policyService.isUserStaffed()
  }
}

function isKind(value: Kinds | StepKey): value is Kinds {
  return Object.values(Kinds).includes(value as Kinds)
}

function isStepKey(value: Kinds | StepKey): value is StepKey {
  return Object.values(StepKey).includes(value as StepKey)
}
