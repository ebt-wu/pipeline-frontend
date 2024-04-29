import { CommonModule } from '@angular/common'
import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { FormattedTextModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { PipelineService } from '../../services/pipeline.service'
import { Observable, debounceTime, firstValueFrom } from 'rxjs'
import { Pipeline } from '@types'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-pipeline-debug',
  templateUrl: './pipeline-debug.component.html',
  styleUrls: ['./pipeline-debug.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, FormattedTextModule, AuthorizationModule],
})
export class PipelineDebugModalComponent implements OnInit {
  constructor(
    private readonly pipelineService: PipelineService,
    private luigiClient: LuigiClient,
  ) {}

  shiftMessage = signal(false)

  watch$: Observable<Pipeline>

  ngOnInit(): void {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
  }

  async deletePipeline(event: MouseEvent) {
    if (event.shiftKey) {
      try {
        await firstValueFrom(this.pipelineService.deletePipeline())
        this.luigiClient.uxManager().closeCurrentModal()
      } catch (error) {
        const errorMessage = (error as Error).message
        alert(errorMessage)
      }
    } else {
      this.shiftMessage.set(true)
    }
  }
}
