import { CommonModule } from '@angular/common'
import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { FormattedTextModule, FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { PipelineService } from '../../services/pipeline.service'
import { Observable, combineLatestWith, debounceTime, firstValueFrom, map } from 'rxjs'
import { Pipeline } from '@types'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { NotManagedServices } from '@generated/graphql'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-pipeline-debug',
  templateUrl: './pipeline-debug.component.html',
  styleUrl: './pipeline-debug.component.css',
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
    const watchPipeline$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const watchNotManagedServices$ = this.pipelineService
      .watchNotManagedServicesInPipeline()
      .pipe(debounceTime(50)) as Observable<NotManagedServices>

    this.watch$ = watchPipeline$.pipe(
      combineLatestWith(watchNotManagedServices$),
      map(([pipeline, notManaged]) => {
        return { ...pipeline, notManagedServices: notManaged }
      }),
    )
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
