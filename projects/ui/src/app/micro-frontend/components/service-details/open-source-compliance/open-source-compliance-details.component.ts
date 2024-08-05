import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import {
  BusyIndicatorModule,
  ButtonComponent,
  FacetModule,
  IconComponent,
  InlineHelpDirective,
  LinkModule,
} from '@fundamental-ngx/core'
import { GetOscRegistrationQuery } from '@generated/graphql'
import { firstValueFrom } from 'rxjs'
import { AsyncPipe, NgIf } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../../services/policy.service'
import { GithubService } from '../../../services/github.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-open-source-compliance-details',
  templateUrl: './open-source-compliance-details.component.html',
  styleUrls: ['./open-source-compliance-details.component.css'],
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
  ],
})
export class OpenSourceComplianceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetOscRegistrationQuery['getOscRegistration']

  isOscRegistrationActive: boolean
  issuetrackerProjectName: string
  issuetrackerProjectUrl: string
  ppmsScv: string

  canUserEditCredentials = false

  loading = signal(false)
  error: string

  OSC_STACKOVERFLOW_LINK = 'https://sap.stackenterprise.co/questions/ask?tags=hyperspace;osc'

  constructor(
    private readonly githubService: GithubService,
    private readonly policyService: PolicyService,
  ) {}

  async ngOnInit() {
    this.loading.set(true)

    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

    this.isOscRegistrationActive = this.serviceDetails.isActive

    if (this.serviceDetails.jiraRef) {
      // TODO: Add Jira info retrieval
    } else {
      const githubInfo = await firstValueFrom(this.githubService.getGithubRepository(this.serviceDetails.ghRepoRef))
      this.issuetrackerProjectName = githubInfo.repository
      this.issuetrackerProjectUrl = githubInfo.repositoryUrl
    }

    this.ppmsScv = this.serviceDetails.ppmsScv

    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/use-cases/validate-your-code-OSCS.html',
      'hyperspace-portal-cicd-oscs',
      'noopener,noreferrer',
    )
  }
}
