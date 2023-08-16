import { AsyncPipe, CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { Component, Input } from '@angular/core'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform'
import { ApolloModule } from 'apollo-angular'
import { PipelineType } from 'src/app/enums'
import { PipelineService } from '../../services/pipeline.service'
import { Observable, debounceTime, firstValueFrom } from 'rxjs'

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

  @Input() pipeline$!: Observable<any>

  constructor(private readonly pipelineService: PipelineService) {}

  pipelineLoading = false
  singleServiceLoading = false

  async createPipeline(type: PipelineType) {
    if (type === PipelineType.FULL_PIPELINE) {
      this.pipelineLoading = true
    } else {
      this.singleServiceLoading = true
    }

    await firstValueFrom(this.pipelineService.createPipeline(type).pipe(debounceTime(100)))

    this.pipelineLoading = false
    this.singleServiceLoading = false
  }
}
