import { ChangeDetectionStrategy, Component } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { AsyncPipe, CommonModule } from '@angular/common'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page'
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core'
import { ApolloModule } from 'apollo-angular'
import { PipelineService } from '../../services/pipeline.service'
import { StartComponent } from '../start/start.component'
import { Observable, debounceTime } from 'rxjs'
import { PipelineComponent } from '../pipeline/pipeline.component'
import { SingleServicesComponent } from '../single-services/single-services.component'
import { PipelineType } from 'src/app/constants'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone: true,
  imports: [
    PlatformDynamicPageModule,
    AsyncPipe,
    FundamentalNgxCoreModule,
    ApolloModule,
    HttpClientModule,
    StartComponent,
    PipelineComponent,
    SingleServicesComponent,
    CommonModule,
  ],
})
export class HomePageComponent {
  pageTitle = 'CI/CD'
  pipelineType = PipelineType

  constructor(private readonly pipelineService: PipelineService) {}

  watch$: Observable<any>

  async ngOnInit(): Promise<void> {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
  }
}
