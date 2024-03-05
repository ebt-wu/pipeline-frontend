import { CommonModule } from '@angular/common'
import { Component, signal } from '@angular/core'
import { FormattedTextModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { PipelineService } from '../../services/pipeline.service'
import { Observable, debounceTime, firstValueFrom } from 'rxjs'
import { Pipeline } from '@types'
import { LuigiClient } from '@dxp/ngx-core/luigi'

@Component({
  standalone: true,
  selector: 'pipeline-debug',
  templateUrl: 'pipeline-debug.component.html',
  styleUrls: ['pipeline-debug.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, FormattedTextModule],
})
export class PipelineDebugModal {
  constructor(
    private readonly pipelineService: PipelineService,
    private luigiClient: LuigiClient,
  ) {}

  shiftMessage = signal(false)

  watch$: Observable<Pipeline>

  async ngOnInit(): Promise<void> {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
  }

  async deletePipeline(event) {
    if (event.shiftKey) {
      try {
        await firstValueFrom(this.pipelineService.deletePipeline())
        this.luigiClient.uxManager().closeCurrentModal()
      } catch (e) {
        alert(e.message)
      }
    } else {
      this.shiftMessage.set(true)
    }
  }
}
