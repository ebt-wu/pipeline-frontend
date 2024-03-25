import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { AsyncPipe, CommonModule } from '@angular/common'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page'
import { FundamentalNgxCoreModule, SvgConfig } from '@fundamental-ngx/core'
import { ApolloModule } from 'apollo-angular'
import { PipelineService } from '../../services/pipeline.service'
import { BehaviorSubject, debounceTime, firstValueFrom, Observable } from 'rxjs'
import { PipelineComponent } from '../pipeline/pipeline.component'
import { Pipeline } from '@types'
import { DebugModeService } from '../../services/debug-mode.service'
import { tntSpotSecret } from '../../../../assets/ts-svg/tnt-spot-secret'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { PipelineType } from '@generated/graphql'

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
    PipelineComponent,
    CommonModule,
  ],
})
export class HomePageComponent implements OnInit {
  pageTitle = 'CI/CD'
  pipelineType = PipelineType
  watch$: Observable<Pipeline>
  pipelineAvail = new BehaviorSubject<boolean>(false)
  readonly spotConfig: SvgConfig = {
    spot: {
      file: tntSpotSecret,
      id: 'tnt-Spot-Secrets-alternate',
    },
  }

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly debugModeService: DebugModeService,
    private readonly luigiClient: LuigiClient,
    private readonly context: DxpLuigiContextService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializePipeline()
    this.watch$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
  }

  navigateToProjectMembers() {
    this.luigiClient.linkManager().navigate(`/projects/${this.context.getContext().projectId}/members`)
  }

  @HostListener('document:keydown.control.d', ['$event'])
  handleCtrlDEvent(_: KeyboardEvent) {
    this.debugModeService.toggleDebugMode()
  }

  private async initializePipeline(): Promise<void> {
    const userPolicies = (await this.context.getContextAsync()).entityContext.project.policies

    if (userPolicies.includes('projectAdmin') || userPolicies.includes('projectMember')) {
      await firstValueFrom(this.pipelineService.createPipeline(this.pipelineType.FullPipeline).pipe(debounceTime(100)))
    }

    this.pipelineAvail.next(true)
  }
}
