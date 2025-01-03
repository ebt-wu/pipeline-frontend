import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core'
import { FlexibleColumnLayout, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CommonModule } from '@angular/common'
import { KindCategory, KindExtensionName, KindName, NotManagedServices } from '@constants'
import { Kinds, StepKey } from '@enums'
import { firstValueFrom, map, Observable } from 'rxjs'
import { APIService } from '../../services/api.service'
import { CumlusServiceDetailsComponent } from '../service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from '../service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from '../service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from '../service-details/piper/piper-service-details.component'
import { StagingServiceServiceDetailsComponent } from '../service-details/staging-service/staging-service-service-details.component'
import { GithubActionsServiceDetailsComponent } from '../service-details/github-actions/github-actions-service-details.component'
import { OpenSourceComplianceDetailsComponent } from '../service-details/open-source-compliance/open-source-compliance-details.component'
import { ExtensionClass, ServiceLevel } from '../../services/extension.types'
import { GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { ExtensionService } from '../../services/extension.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { JiraService } from '../../services/jira.service'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'
import { SharedDataService } from '../../services/shared-data.service'
import { ErrorMessageComponent } from '../error-message/error-message.component'
import { ErrorMessage, Pipeline } from '@types'
import { GithubAdvancedSecurityServiceDetailsComponent } from '../service-details/github-advanced-security/github-advanced-security-service-details.component'
import { MenuComponent, MenuTriggerDirective, PlatformMenuButtonModule } from '@fundamental-ngx/platform'
import { GithubRepository, JenkinsPipeline, PiperConfig } from '@generated/graphql'
import { SonarServiceDetailsComponent } from '../service-details/sonar/sonar-service-details.component'
import { AzureServiceDetailsComponent } from '../service-details/azure/azure-service-details.component'
import { XMakeServiceDetailsComponent } from '../service-details/xmake/xmake-service-details.component'
import { CnbServiceDetailsComponent } from '../service-details/cnb/cnb-service-details.component'
import { CommonRepositoryServiceDetailsComponent } from '../service-details/commonrepository/common-repository-service-details.component'
import { BlackDuckServiceDetailsComponent } from '../service-details/black-duck/black-duck-service-details.component'
import { CheckmarxServiceDetailsComponent } from '../service-details/checkmarx/checkmarx-service-details.component'
import { CXOneServiceDetailsComponent } from '../service-details/cx-one/cx-one-service-details.component'
import { FortifyServiceDetailsComponent } from '../service-details/fortify/fortify-service-details.component'
import { WhiteSourceServiceDetailsComponent } from '../service-details/whitesource/whitesource-service-details.component'
import { PpmsFossServiceDetailsComponent } from '../service-details/ppms-foss/ppms-foss-service-details.component'
import { KubernetesServiceDetailsComponent } from '../service-details/kubernetes/kubernetes-service-details.component'
import { CloudFoundryServiceDetailsComponent } from '../service-details/cloud-foundry/cloud-foundry-service-details.component'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceDetails = any

const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' })

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-old-service-details-skeleton',
  templateUrl: './old-service-details-skeleton.component.html',
  standalone: true,
  styleUrl: './old-service-details-skeleton.component.css',
  imports: [
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
  ],
})
export class OldServiceDetailsSkeletonComponent implements OnInit {
  @Input() activeTile: string
  @Input() localLayout: FlexibleColumnLayout
  @Input() pipeline: Pipeline
  @Output() readonly localLayoutEvent: EventEmitter<FlexibleColumnLayout> = new EventEmitter<FlexibleColumnLayout>()

  // maps
  kindName = KindName
  kindCategory = KindCategory
  kinds = Kinds
  stepKeys = StepKey

  dxpContext$: Observable<DxpContext>

  serviceDetailsLoading = signal(false)
  serviceDetails = signal<ServiceDetails>({})
  serviceUrl = signal('')
  serviceCreationTimestamp = signal<Date>(null)
  errors = signal<ErrorMessage[]>([])
  extensionClasses = signal<ExtensionClass[]>([])
  catalogUrl = signal('')
  resourceName = signal('')

  isKubernetes = signal<boolean>(false)
  isCloudFoundry = signal<boolean>(false)

  get getPipelineId() {
    return this.pipeline?.labels?.find((label) => label.key === 'sap.hyperspace/pipeline-id')?.value
  }

  constructor(
    private readonly api: APIService,
    private readonly extensionService: ExtensionService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly luigiClient: LuigiClient,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
    private readonly sharedService: SharedDataService,
    private readonly jiraService: JiraService,
    readonly debugModeService: DebugModeService,
  ) {}

  // eslint-disable-next-line @angular-eslint/no-async-lifecycle-method
  async ngOnInit() {
    this.dxpContext$ = this.luigiService.contextObservable().pipe(map((value) => value.context))
    const context = await this.luigiService.getContextAsync()
    this.catalogUrl.set(context.frameBaseUrl + '/catalog')
    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.extensionClasses.set(extensionClasses)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.sharedService.selectedResourceData$.subscribe(async (resource) => {
      if (resource == null) {
        return
      }
      this.resourceName.set(resource.name)
      await this.loadDetails(resource.kind, resource.name)
    })
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

  determineServiceCreationTimestamp(kind: Kinds | StepKey = null) {
    if (kind === null) {
      return
    }

    if ((this.serviceDetails() as { creationTimestamp: string }).creationTimestamp) {
      this.serviceCreationTimestamp.set(
        new Date((this.serviceDetails() as { creationTimestamp: string }).creationTimestamp),
      )
    }

    if (NotManagedServices.includes(kind as StepKey)) {
      if (this.pipeline.notManagedServices?.pipelineCreationTimestamp) {
        this.serviceCreationTimestamp.set(new Date(this.pipeline.notManagedServices.pipelineCreationTimestamp))
      }
    }
  }

  async loadDetails(kind: Kinds | StepKey, name: string) {
    const { githubRepoUrl, githubInstance, githubOrgName, githubRepoName } =
      await this.api.githubService.getGithubMetadata()

    this.serviceDetailsLoading.set(true)

    this.serviceDetails.set({})
    this.serviceUrl.set('')
    this.serviceCreationTimestamp.set(null)
    try {
      switch (kind) {
        case Kinds.JENKINS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.api.jenkinsService.getJenkinsPipeline(name)))
          this.serviceUrl.set((this.serviceDetails() as JenkinsPipeline).jobUrl)
          break
        case Kinds.GITHUB_REPOSITORY:
          this.serviceDetails.set(await firstValueFrom(this.api.githubService.getGithubRepository(name)))
          this.serviceUrl.set((this.serviceDetails() as GithubRepository).repositoryUrl)
          break
        case Kinds.CUMULUS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.api.cumulusService.getCumulusPipeline(name)))
          break
        case Kinds.PIPER_CONFIG:
          this.serviceDetails.set(await firstValueFrom(this.api.piperService.getPiperConfig(name)))
          this.serviceUrl.set((this.serviceDetails() as PiperConfig).pullRequestURL)
          break
        case Kinds.STAGING_SERVICE_CREDENTIAL:
          this.serviceDetails.set(await firstValueFrom(this.api.stagingServiceService.getStagingServiceCredential()))
          break
        case StepKey.AZURE_DEV_OPS:
          const azureDetails = this.pipeline.notManagedServices[StepKey.AZURE_DEV_OPS]
          this.serviceDetails.set(azureDetails)
          break
        case StepKey.CNB:
          const cnbDetails = this.pipeline.notManagedServices[StepKey.CNB]
          this.serviceDetails.set(cnbDetails)
          break
        case StepKey.XMAKE:
          const xmakeDetails = this.pipeline.notManagedServices[StepKey.XMAKE]
          this.serviceDetails.set(xmakeDetails)
          break
        case StepKey.COMMON_REPOSITORY:
          const commonRepositoryDetails = this.pipeline.notManagedServices[StepKey.COMMON_REPOSITORY]
          this.serviceDetails.set(commonRepositoryDetails)
          break
        case Kinds.GITHUB_ACTION:
        case Kinds.GITHUB_ACTIONS_WORKFLOW:
          this.serviceDetails.set(
            await firstValueFrom(
              this.api.githubActionsService.getGithubActionsCrossNamespace(githubInstance, githubOrgName),
            ),
          )
          if (githubRepoUrl) {
            this.serviceUrl.set(githubRepoUrl + '/actions')
          }
          break
        case Kinds.GITHUB_ADVANCED_SECURITY:
          if (githubRepoUrl) {
            this.serviceUrl.set(githubRepoUrl)
          }
          this.serviceDetails.set({
            ...(await firstValueFrom(this.api.githubAdvancedSecurityService.getGithubAdvancedSecurity(name))),
            repoUrl: this.serviceUrl(),
            githubRepoName,
          })
          break
        case Kinds.OPEN_SOURCE_COMPLIANCE:
          const oscRegistration = await firstValueFrom(
            this.api.openSourceComplianceService.getOpenSourceComplianceRegistration(),
          )
          if (oscRegistration.jiraRef === '') {
            this.serviceUrl.set(githubRepoUrl + '/issues')
          } else {
            const jiraItems = await firstValueFrom(this.jiraService.getJiraProjects())
            const jiraItem = jiraItems.find((item) => item.resourceName === oscRegistration.jiraRef)
            this.serviceUrl.set('https://' + jiraItem.jiraInstanceUrl + '/projects/' + jiraItem.projectKey)
          }

          this.serviceDetails.set(oscRegistration)
          break
        case Kinds.SONAR_QUBE_PROJECT:
          this.serviceDetails.set(await firstValueFrom(this.api.sonarService.getSonarqubeProject(name)))
          break
        case StepKey.BLACK_DUCK_HUB:
          const blackduckDetails = this.pipeline.notManagedServices[StepKey.BLACK_DUCK_HUB]
          this.serviceDetails.set(blackduckDetails)
          break
        case StepKey.CHECKMARX:
          const checkmarxDetails = this.pipeline.notManagedServices[StepKey.CHECKMARX]
          this.serviceDetails.set(checkmarxDetails)
          break
        case StepKey.CX_ONE:
          const cxOneDetails = this.pipeline.notManagedServices[StepKey.CX_ONE]
          this.serviceDetails.set(cxOneDetails)
          break
        case StepKey.FORTIFY:
          const fortifyDetails = this.pipeline.notManagedServices[StepKey.FORTIFY]
          this.serviceDetails.set(fortifyDetails)
          break
        case StepKey.WHITE_SOURCE:
          const whiteSourceDetails = this.pipeline.notManagedServices[StepKey.WHITE_SOURCE]
          this.serviceDetails.set(whiteSourceDetails)
          break
        case StepKey.PPMS_FOSS:
          const ppmsFossDetails = this.pipeline.notManagedServices[StepKey.PPMS_FOSS]
          this.serviceDetails.set(ppmsFossDetails)
          break
        case StepKey.KUBERNETES:
          const kubernetesDetails = this.pipeline.notManagedServices[StepKey.KUBERNETES]
          this.serviceDetails.set(kubernetesDetails)
          break
        case StepKey.CLOUD_FOUNDRY:
          const cloudFoundryDetails = this.pipeline.notManagedServices[StepKey.CLOUD_FOUNDRY]
          this.serviceDetails.set(cloudFoundryDetails)
          break
      }

      this.determineServiceCreationTimestamp(kind)
    } catch (err) {
      const errorMessage = (err as Error).message
      this.errors.update((errors) => {
        errors.push({
          title: `Load service details failed for kind ${kind}`,
          message: `${errorMessage}`,
        })
        return errors
      })
    } finally {
      this.serviceDetailsLoading.set(false)
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
        await firstValueFrom(this.api.githubAdvancedSecurityService.deleteGithubAdvancedSecurity(this.resourceName()))
      })
      .catch((err) => {
        const errorMessage = (err as Error).message
        this.errors.update((errors) => {
          errors.push({ title: 'Deleting Static Security Checks failed', message: errorMessage })
          return errors
        })
      })
  }

  openService() {
    window.open(this.serviceUrl(), '_blank', 'noopener, noreferrer')
  }

  public getIcon(extension: ExtensionClass): string {
    if (extension) {
      return this.extensionService.getIcon(extension)
    }
    return ''
  }

  public getExtensionClass(activeTile: string): ExtensionClass {
    const extensionName = KindExtensionName[activeTile] as string
    return this.extensionClasses().find((extensionClass) => extensionClass.name == extensionName)
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

  formatDate(date: Date) {
    if (!this.isDate(date)) {
      return null
    }

    return dateFormatter.format(date)
  }

  getIsoString(date: Date) {
    if (!this.isDate(date)) {
      return null
    }

    return date.toISOString()
  }

  isDate(date: Date) {
    return !isNaN(date.getTime())
  }

  openGHASScannnerResults() {
    window.open(this.serviceUrl() + '/security/code-scanning', '_blank', 'noopener, noreferrer')
  }

  openGHASSettings() {
    window.open(this.serviceUrl() + '/settings/security_analysis/', '_blank', 'noopener, noreferrer')
  }
}
