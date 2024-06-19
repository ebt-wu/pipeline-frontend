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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-static-security-check-details',
  templateUrl: './static-security-check-details.component.html',
  styleUrls: ['./static-security-check-details.component.css'],
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
export class StaticSecurityCheckDetailsComponent implements OnInit {
  @Input() serviceDetails: GetGitHubAdvancedSecurityQuery['getGitHubAdvancedSecurity'] & {
    repoUrl: string
    githubRepoName: string
  }

  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline
  githubSecret: Secret

  canUserEditCredentials = false

  loading = signal(false)
  pendingShowInVault = signal(false)
  error: string

  GITHUB_ACTIONS_DOCU_LINK =
    'https://github.wdf.sap.corp/pages/Security-Testing/doc/ghas/producing/#deploying-codeql-using-github-actions'
  AUDIT_FINDINGS_DOCU_LINK =
    'https://github.wdf.sap.corp/pages/Security-Testing/doc/ghas/consuming/#which-findings-to-audit'
  ADD_SCAN_PROJECT_SIRIUS_DOCU_LINK = 'https://wiki.one.int.sap/wiki/x/s9XS7w'

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cumulusService: CumulusService,
    private readonly secretService: SecretService,
    private readonly policyService: PolicyService,
  ) {}

  async ngOnInit() {
    this.loading.set(true)
    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

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
    )
  }

  async showInVault(vaultPath: string) {
    this.pendingShowInVault.set(true)
    window.open(await this.secretService.getVaultUrlOfSecret(vaultPath), '_blank')
    this.pendingShowInVault.set(false)
  }
}
