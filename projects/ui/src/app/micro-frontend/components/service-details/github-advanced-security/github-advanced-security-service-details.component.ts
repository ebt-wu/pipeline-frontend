import { NgIf } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { Kinds } from '@enums'
import { BusyIndicatorModule, ButtonComponent, FacetModule, LinkModule } from '@fundamental-ngx/core'
import { CumulusPipeline } from '@generated/graphql'
import { GithubAdvancedSecurityServiceDetails, Pipeline } from '@types'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { CumulusService } from '../../../services/cumulus.service'
import { PipelineService } from '../../../services/pipeline.service'
import { PolicyService } from '../../../services/policy.service'
import { SecretService } from '../../../services/secret.service'
import { BaseServiceDetailsComponent } from '../base-service-details.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-github-advanced-security-service-details',
  templateUrl: './github-advanced-security-service-details.component.html',
  styleUrl: './github-advanced-security-service-details.component.css',
  imports: [BusyIndicatorModule, FacetModule, LinkModule, NgIf, AuthorizationModule, ButtonComponent],
})
export class GithubAdvancedSecurityServiceDetailsComponent extends BaseServiceDetailsComponent implements OnInit {
  @Input() serviceDetails: GithubAdvancedSecurityServiceDetails

  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline

  loading = signal(false)
  error: string

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
    this.loading.set(false)
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/managed-services/validate/ghas.html',
      '_blank',
      'noopener, noreferrer',
    )
  }
}
