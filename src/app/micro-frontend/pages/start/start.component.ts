import { AsyncPipe, CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform'
import { ApolloModule } from 'apollo-angular'
import { PipelineService } from '../../services/pipeline.service'
import { Observable, debounceTime, firstValueFrom } from 'rxjs'
import { Pipeline } from 'src/app/types'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { DebugModeService } from '../../services/debug-mode.service'
import { PipelineType } from 'src/generated/graphql'

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  standalone: true,
  styleUrls: ['./start.component.css'],
  imports: [
    PlatformDynamicPageModule,
    AsyncPipe,
    FundamentalNgxCoreModule,
    ApolloModule,
    HttpClientModule,
    CommonModule,
  ],
})
export class StartComponent {
  pipelineType = PipelineType

  @Input() pipeline$!: Observable<Pipeline>

  constructor(
    private readonly luigiClient: LuigiClient,
    private readonly pipelineService: PipelineService,
    readonly debugModeService: DebugModeService,
  ) {}

  pipelineLoading = false
  singleServiceLoading = false

  async createPipeline(type: PipelineType) {
    if (type === PipelineType.FullPipeline) {
      this.pipelineLoading = true
    } else {
      this.singleServiceLoading = true
    }

    await firstValueFrom(this.pipelineService.createPipeline(type).pipe(debounceTime(100)))

    this.pipelineLoading = false
    this.singleServiceLoading = false
  }

  openImportPipelineModal() {
    this.luigiClient.linkManager().fromVirtualTreeRoot().openAsModal('import-pipeline', {
      title: 'Import Existing Pipeline',
      width: '30rem',
      height: '26rem',
    })
  }

  openDocumentation() {
    window.open('https://pages.github.tools.sap/hyperspace/cicd-setup-documentation/', '_blank')
  }
}
