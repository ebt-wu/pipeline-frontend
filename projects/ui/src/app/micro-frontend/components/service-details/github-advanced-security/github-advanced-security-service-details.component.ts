import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import {
  BusyIndicatorModule,
  ButtonComponent,
  FacetModule,
  IconComponent,
  InlineHelpDirective,
  LinkModule,
} from '@fundamental-ngx/core'
import { CumulusPipeline, GetGitHubAdvancedSecurityQuery } from '@generated/graphql'
import { PipelineService } from '../../../services/pipeline.service'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { Kinds } from '@enums'
import { Pipeline } from '@types'
import { CumulusService } from '../../../services/cumulus.service'
import { AsyncPipe, NgIf } from '@angular/common'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { Secret, SecretService } from '../../../services/secret.service'
import { PolicyService } from '../../../services/policy.service'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-github-advanced-security-service-details',
  templateUrl: './github-advanced-security-service-details.component.html',
  styleUrl: './github-advanced-security-service-details.component.css',
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
export class GithubAdvancedSecurityServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GetGitHubAdvancedSecurityQuery['getGitHubAdvancedSecurity'] & {
    repoUrl: string
    githubRepoName: string
  }

  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline
  githubSecret: Secret

  loading = signal(false)
  error: string

  GITHUB_ACTIONS_DOCU_LINK =
    'https://github.wdf.sap.corp/pages/Security-Testing/doc/ghas/producing/#deploying-codeql-using-github-actions'
  AUDIT_FINDINGS_DOCU_LINK =
    'https://github.wdf.sap.corp/pages/Security-Testing/doc/ghas/consuming/#which-findings-to-audit'
  ADD_SCAN_PROJECT_SIRIUS_DOCU_LINK = 'https://wiki.one.int.sap/wiki/x/s9XS7w'

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cumulusService: CumulusService,
    protected override readonly secretService: SecretService,
    protected override readonly policyService: PolicyService,
  ) {
    super(policyService, secretService)
  }

  // eslint-disable-next-line @angular-eslint/no-async-lifecycle-method
  async ngOnInit() {
    this.loading.set(true)
    await super.ngOnInit()

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const cumulusRef = (await firstValueFrom(this.watch$)).resourceRefs.find(
      (ref) => ref.kind === Kinds.CUMULUS_PIPELINE,
    )

    if (cumulusRef && cumulusRef.name) {
      this.cumulusInfo = await firstValueFrom(this.cumulusService.getCumulusPipeline(cumulusRef.name))
    }

    const secrets = await firstValueFrom(this.secretService.getPipelineSecrets())

    // Try to get a secret from the list that matches the instance
    const githubInstance = new URL(this.serviceDetails.repoUrl).hostname.replace(/\./g, '-')
    this.githubSecret = secrets.find((secret) => secret.path.includes(githubInstance))
    // If no secret matches the instance, just look for one with github in the name (could be the case from transferred pipelines)
    if (!this.githubSecret) {
      this.githubSecret = secrets.find((secret) => secret.path.includes('github'))
    }
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/connected-tools/validate/ghas.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
