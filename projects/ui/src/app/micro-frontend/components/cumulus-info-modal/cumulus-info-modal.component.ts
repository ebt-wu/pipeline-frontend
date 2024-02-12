import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { NgIf } from '@angular/common'
import { PipelineService } from '../../services/pipeline.service'
import { debounceTime, firstValueFrom, Observable } from 'rxjs'
import { Pipeline } from '@types'
import { Kinds } from '@enums'
import { CumulusService } from '../../services/cumulus.service'
import { SecretService } from '../../services/secret.service'
import { CumulusPipeline } from '@generated/graphql'
import { LuigiClient } from '@dxp/ngx-core/luigi'

@Component({
  selector: 'app-cumulus-info-modal',
  templateUrl: './cumulus-info-modal.component.html',
  styleUrls: ['./cumulus-info-modal.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, FundamentalNgxCoreModule],
})
export class CumulusInfoModalComponent implements OnInit {
  watch$: Observable<Pipeline>
  cumulusInfo: CumulusPipeline

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cumulusService: CumulusService,
    private readonly secretService: SecretService,
    private readonly luigiClient: LuigiClient,
  ) {}

  async ngOnInit() {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))

    const cumulusRef = (await firstValueFrom(this.watch$)).resourceRefs.find(
      (ref) => ref.kind === Kinds.CUMULUS_PIPELINE,
    )
    if (cumulusRef && cumulusRef.name) {
      this.cumulusInfo = await firstValueFrom(this.cumulusService.getCumulusPipeline(cumulusRef.name))
    }
  }

  async showCumulusTokenInVault() {
    // cumulus secret path is hardcoded here: https://github.tools.sap/hyperspace/pipeline-backend/blob/937fc53e719077cc63b97c7b6277fde838c304dd/service/cumulus/service.go#L79
    const cumulusSecretPath = 'GROUP-SECRETS/cumulus'
    window.open(await this.secretService.getVaultUrlOfSecret(cumulusSecretPath), '_blank')
  }

  close() {
    this.luigiClient.uxManager().closeCurrentModal()
  }
}
