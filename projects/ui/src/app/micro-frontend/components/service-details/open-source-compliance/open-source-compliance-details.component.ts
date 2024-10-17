import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import {
  BusyIndicatorModule,
  ButtonComponent,
  FacetModule,
  IconComponent,
  InlineHelpDirective,
  LinkModule,
} from '@fundamental-ngx/core'
import { MessageStripModule } from '@fundamental-ngx/core'
import { GetOscRegistrationQuery } from '@generated/graphql'
import { firstValueFrom } from 'rxjs'
import { AsyncPipe, NgIf } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'
import { APIService } from '../../../services/api.service'
import { SecretService } from '../../../services/secret.service'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-open-source-compliance-details',
  templateUrl: './open-source-compliance-details.component.html',
  styleUrl: './open-source-compliance-details.component.css',
  imports: [
    BusyIndicatorModule,
    FacetModule,
    LinkModule,
    AsyncPipe,
    NgIf,
    AuthorizationModule,
    ButtonComponent,
    IconComponent,
    InlineHelpDirective,
    MessageStripModule,
  ],
})
export class OpenSourceComplianceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetOscRegistrationQuery['getOscRegistration']

  isOscRegistrationActive: boolean
  issuetrackerProjectName: string
  issuetrackerProjectUrl: string
  ppmsScv: string
  addScvLink =
    'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/use-cases/validate-your-code-OSCS.html'

  loading = signal(false)
  error: string

  OSC_SNOW_LINK =
    'https://itsm.services.sap/sp?id=sc_cat_item&sys_id=703f22d51b3b441020c8fddacd4bcbe2&service_offering=67bb88e2eb3c129095cdf897cad0cd93'
  OSC_ADD_SCV_IN_PIPER_LINK =
    'https://pages.github.tools.sap/hyperspace/academy/services/osc/gettingStarted/#adapt-piper-configuration'

  constructor(
    private readonly apiService: APIService,
    protected override policyService: PolicyService,
    protected override secretService: SecretService,
  ) {
    super(policyService, secretService)
  }

  async ngOnInit() {
    this.loading.set(true)

    await super.ngOnInit()
    this.isOscRegistrationActive = this.serviceDetails.isActive

    if (this.serviceDetails.jiraRef) {
      const jiraProjects = await firstValueFrom(this.apiService.jiraService.getJiraItems())
      const jiraProject = jiraProjects.find((project) => project.resourceName === this.serviceDetails.jiraRef)

      if (jiraProject) {
        this.issuetrackerProjectName = jiraProject.projectKey

        try {
          this.issuetrackerProjectUrl = new URL(
            `/projects/${jiraProject.projectKey}`,
            `https://${jiraProject.jiraInstanceUrl}`,
          ).href
        } catch (e) {
          this.error = 'failed to construct Jira project URL'
        }
      }
    } else {
      const githubInfo = await firstValueFrom(
        this.apiService.githubService.getGithubRepository(this.serviceDetails.ghRepoRef),
      )
      this.issuetrackerProjectName = githubInfo.repository
      this.issuetrackerProjectUrl = githubInfo.repositoryUrl + '/issues'
    }

    this.ppmsScv = this.serviceDetails.ppmsScv

    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/osc.html',
      '_blank',
      'noopener, noreferrer',
    )
  }

  openSnow() {
    window.open(this.OSC_SNOW_LINK, '_blank', 'noopener, noreferrer')
  }
}
