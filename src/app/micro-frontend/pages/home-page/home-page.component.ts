import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { AsyncPipe, CommonModule } from '@angular/common'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page'
import { FundamentalNgxCoreModule, SvgConfig } from '@fundamental-ngx/core'
import { ApolloModule } from 'apollo-angular'
import { PipelineService } from '../../services/pipeline.service'
import { StartComponent } from '../start/start.component'
import { Observable, debounceTime } from 'rxjs'
import { PipelineComponent } from '../pipeline/pipeline.component'
import { SingleServicesComponent } from '../single-services/single-services.component'
import { Pipeline } from 'src/app/types'
import { DebugModeService } from '../../services/debug-mode.service'
import { tntSpotSecret } from '../../../../assets/ts-svg/tnt-spot-secret'
import { AuthorizationModule } from '@dxp/ngx-core/authorization';
import { LuigiClient, DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { PipelineType } from 'src/generated/graphql'



@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone: true,
  imports: [
    AuthorizationModule,
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

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly debugModeService: DebugModeService,
    private readonly luigiClient: LuigiClient,
    private readonly context: DxpLuigiContextService
  ) { }

  watch$: Observable<Pipeline>

  ngOnInit(): void {
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
  }

  navigateToProjectMembers() {
    this.luigiClient.linkManager().navigate(
      `/projects/${this.context.getContext().projectId}/members`
    );
  }

  readonly spotConfig: SvgConfig = {
    spot: {
      file: tntSpotSecret,
      id: 'tnt-Spot-Secrets-alternate',
    },
  };

  @HostListener('document:keydown.control.d', ['$event'])
  handleCtrlDEvent(_: KeyboardEvent) {
    this.debugModeService.toggleDebugMode()
  }
}
