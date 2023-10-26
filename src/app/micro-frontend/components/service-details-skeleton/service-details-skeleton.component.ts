import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { CommonModule } from '@angular/common'
import { KindCategory, KindExtensionName, KindName } from '../../../constants'
import { Kinds } from '../../../enums'
import { firstValueFrom, map, Observable } from 'rxjs'
import { APIService } from '../../services/api.service'
import { CumlusServiceDetailsComponent } from '../service-details/cumulus/cumulus-service-details.component'
import { GithubServiceDetailsComponent } from '../service-details/github/github-service-details.component'
import { JenkinServiceDetailsComponent } from '../service-details/jenkins/jenkins-service-details.component'
import { PiperServiceDetailsComponent } from '../service-details/piper/piper-service-details.component'
import { StagingServiceServiceDetailsComponent } from '../service-details/staging-service/staging-service-service-details.component'
import { GithubActionsServiceDetailsComponent } from '../service-details/github-actions/github-actions-service-details.component'
import { ExtensionClass, ServiceLevel } from '../../services/extension.types'
import { GitHubIssueLabels, GitHubIssueLinkService } from '../../services/github-issue-link.service'
import { ExtensionService } from '../../services/extension.service'
import { DebugModeService } from '../../services/debug-mode.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { DxpContext } from '@dxp/ngx-core/common'
import { SharedDataService } from '../../services/shared-data.service'
import { FlexibleColumnLayout } from '@fundamental-ngx/core/flexible-column-layout/constants'
import { ErrorMessageComponent } from '../error-message/error-message.component'

type ServiceDetails = any

const dateFormatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' })

type Error = {
  title: string
  message: string
}

@Component({
  selector: 'app-service-details-skeleton',
  templateUrl: './service-details-skeleton.component.html',
  standalone: true,
  styleUrls: ['./service-details-skeleton.component.css'],
  imports: [
    CommonModule,
    FundamentalNgxCoreModule,
    CumlusServiceDetailsComponent,
    GithubServiceDetailsComponent,
    JenkinServiceDetailsComponent,
    PiperServiceDetailsComponent,
    StagingServiceServiceDetailsComponent,
    GithubActionsServiceDetailsComponent,
    ErrorMessageComponent,
  ],
})
export class ServiceDetailsSkeletonComponent implements OnInit {
  @Input() activeTile: string
  @Input() localLayout: FlexibleColumnLayout
  @Output() localLayoutEvent: EventEmitter<FlexibleColumnLayout> = new EventEmitter<FlexibleColumnLayout>()

  // maps
  kindName = KindName
  kindCategory = KindCategory

  dxpContext$: Observable<DxpContext>

  serviceDetailsLoading = signal(false)
  serviceDetails = signal<ServiceDetails>({})
  serviceUrl = signal('')
  serviceCreationTimestamp = signal<Date>(null)
  errors = signal<Error[]>([])
  extensionClasses = signal<ExtensionClass[]>([])
  catalogUrl = signal('')

  constructor(
    private readonly api: APIService,
    private readonly extensionService: ExtensionService,
    private readonly luigiService: DxpLuigiContextService,
    private readonly githubIssueLinkService: GitHubIssueLinkService,
    private readonly sharedService: SharedDataService,
    readonly debugModeService: DebugModeService,
  ) {}

  async ngOnInit() {
    this.dxpContext$ = this.luigiService.contextObservable().pipe(map((value) => value.context))
    const context = (await this.luigiService.getContextAsync()) as any
    this.catalogUrl.set(context.frameBaseUrl + '/catalog')
    const extensionClasses = await firstValueFrom(this.extensionService.getExtensionClassesForScopesQuery())
    this.extensionClasses.set(extensionClasses)

    this.sharedService.selectedResourceData$.subscribe(async (resource) => {
      if (resource == null) {
        return
      }
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

  async loadDetails(kind: Kinds, name: string) {
    this.serviceDetailsLoading.set(true)

    this.serviceDetails.set({})
    this.serviceUrl.set('')
    this.serviceCreationTimestamp.set(null)

    try {
      switch (kind) {
        case Kinds.JENKINS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.api.jenkinsService.getJenkinsPipeline(name)))
          this.serviceUrl.set(this.serviceDetails().jobUrl)
          break
        case Kinds.GITHUB_REPOSITORY:
          this.serviceDetails.set(await firstValueFrom(this.api.githubService.getGithubRepository(name)))
          this.serviceUrl.set(this.serviceDetails().repositoryUrl)
          break
        case Kinds.CUMULUS_PIPELINE:
          this.serviceDetails.set(await firstValueFrom(this.api.cumulusService.getCumulusPipeline(name)))
          break
        case Kinds.PIPER_CONFIG:
          this.serviceDetails.set(await firstValueFrom(this.api.piperService.getPiperConfig(name)))
          this.serviceUrl.set(this.serviceDetails().pullRequestURL)
          break
        case Kinds.STAGING_SERVICE_CREDENTIAL:
          this.serviceDetails.set(await firstValueFrom(this.api.stagingServiceService.getStagingServiceCredential()))
          break
        case Kinds.GITHUB_ACTION:
          this.serviceDetails.set(await firstValueFrom(this.api.githubActionsService.getGithubActions(name)))
          this.serviceUrl.set(
            `https://github.tools.sap/organizations/${this.serviceDetails().githubOrganization}/settings/actions`,
          )
          break
      }

      this.serviceCreationTimestamp.set(new Date(this.serviceDetails().creationTimestamp))
    } catch (err) {
      this.errors.update((errors) => {
        errors.push({
          title: `Load service details failed for kind ${kind}`,
          message: `${err.message}`,
        })
        return errors
      })
    } finally {
      this.serviceDetailsLoading.set(false)
    }
  }

  openService() {
    window.open(this.serviceUrl(), '_blank')
  }

  public getIcon(extension: ExtensionClass): string {
    if (extension) {
      return this.extensionService.getIcon(extension)
    }
    return ''
  }

  public getExtensionClass(activeTile: string): ExtensionClass {
    const extensionName = KindExtensionName[activeTile]
    return this.extensionClasses().find((extensionClass) => extensionClass.name == extensionName)
  }

  getComma(element: any, array: any[]): string {
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

  missingServiceDetailsTicketUrl(kind: string, project: string, baseUrl: string, user: string): string {
    return this.githubIssueLinkService.getIssueLink(
      `Service info for service ${this.kindName[kind]} missing`,
      `
<!-- Thank you for taking the time to report this issue.
To help us debug, please describe where you encountered it below.
-->


### Debugging Information (automatically generated)
Service details from LeanIX are missing for the service \`${this.kindName[kind]}\`. 

The information might be missing in the Hyperspace portal extension backend, LeanIX or there is a misconfiguration in the CI/CD setup UI.

**Project this issue was created from:** [${project}](${baseUrl}/projects/${project})
**Timestamp:** ${new Date()}
**User:** ${user}
    `,
      [GitHubIssueLabels.EXTERNAL, GitHubIssueLabels.PORTAL],
    )
  }

  formatDate(date: Date) {
    return dateFormatter.format(date)
  }
}
