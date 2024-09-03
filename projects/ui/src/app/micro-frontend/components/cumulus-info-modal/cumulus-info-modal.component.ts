import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FundamentalNgxCoreModule, InlineHelpModule } from '@fundamental-ngx/core'
import { NgIf } from '@angular/common'
import { PipelineService } from '../../services/pipeline.service'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { Pipeline } from '@types'
import { Kinds } from '@enums'
import { CumulusService } from '../../services/cumulus.service'
import { SecretService } from '../../services/secret.service'
import { CumulusPipeline, PipelineType } from '@generated/graphql'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { PlatformButtonModule } from '@fundamental-ngx/platform'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { PolicyService } from '../../services/policy.service'

@Component({
  selector: 'app-cumulus-info-modal',
  templateUrl: './cumulus-info-modal.component.html',
  styleUrl: './cumulus-info-modal.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, FundamentalNgxCoreModule, InlineHelpModule, PlatformButtonModule, AuthorizationModule],
})
export class CumulusInfoModalComponent implements OnInit {
  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline
  canUserEditCredentials = false
  loading: boolean

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cumulusService: CumulusService,
    private readonly secretService: SecretService,
    private readonly luigiClient: LuigiClient,
    private readonly policyService: PolicyService,
  ) {}

  async ngOnInit() {
    this.loading = true
    this.canUserEditCredentials = await this.policyService.canUserEditCredentials()

    // If there is no pipeline we create one on-the-fly
    if (await this.policyService.canUserSetUpPipeline()) {
      await firstValueFrom(
        this.pipelineService
          .createPipeline({
            pipelineType: PipelineType.FullPipeline,
          })
          .pipe(debounceTime(100)),
      )
    }
    this.luigiClient.linkManager().updateModalSettings({ height: '565px', width: '420px' })

    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))

    const cumulusRef = (await firstValueFrom(this.watch$)).resourceRefs.find(
      (ref) => ref.kind === Kinds.CUMULUS_PIPELINE,
    )
    if (cumulusRef && cumulusRef.name) {
      this.cumulusInfo = await firstValueFrom(this.cumulusService.getCumulusPipeline(cumulusRef.name))
    }
    this.loading = false
  }

  async showCumulusTokenInVault() {
    // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
    const cumulusSecretPath = 'GROUP-SECRETS/cumulus'
    window.open(await this.secretService.getVaultUrlOfSecret(cumulusSecretPath), '_blank', 'noopener, noreferrer')
  }

  openDocumentation() {
    window.open(
      'https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/how-tos/store-compliance-artifacts.html#using-cumulus-to-store-compliance-results-for-an-existing-pipeline',
      '_blank',
      'noopener, noreferrer',
    )
  }

  async copyToClipboard(textToWrite: string) {
    const cb = navigator.clipboard

    if (textToWrite) {
      await cb.writeText(textToWrite)
    }
  }

  openPipelineUi() {
    this.luigiClient.linkManager().fromContext('component').navigate('pipeline-ui')
  }
  close() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
