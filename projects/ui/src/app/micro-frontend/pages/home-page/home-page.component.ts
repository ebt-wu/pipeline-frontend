import { AsyncPipe, CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostListener, OnInit, signal } from '@angular/core'
import { StepsOverallOrder } from '@constants'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { FundamentalNgxCoreModule, SvgConfig } from '@fundamental-ngx/core'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page'
import { NotManagedServices, PipelineType } from '@generated/graphql'
import { Pipeline } from '@types'
import { ApolloModule } from 'apollo-angular'
import { BehaviorSubject, debounceTime, firstValueFrom, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { tntSpotSecret } from '../../../../assets/ts-svg/tnt-spot-secret'
import { DebugModeService } from '../../services/debug-mode.service'
import { GithubActionsService } from '../../services/github-actions.service'
import { GithubService } from '../../services/github.service'
import { PipelineService } from '../../services/pipeline.service'
import { PolicyService } from '../../services/policy.service'
import { PipelineComponent } from '../pipeline/pipeline.component'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  standalone: true,
  imports: [
    AuthorizationModule,
    PlatformDynamicPageModule,
    AsyncPipe,
    FundamentalNgxCoreModule,
    ApolloModule,
    PipelineComponent,
    CommonModule,
  ],
})
export class HomePageComponent implements OnInit {
  pipelineType = PipelineType
  watch$: Observable<Pipeline>
  pipelineAvail = new BehaviorSubject<boolean>(false)
  loading = signal(false)
  readonly spotConfig: SvgConfig = {
    spot: {
      file: tntSpotSecret,
      id: 'tnt-Spot-Secrets-alternate',
    },
  }

  constructor(
    private readonly pipelineService: PipelineService,
    private readonly githubActionsService: GithubActionsService,
    private readonly githubService: GithubService,
    private readonly debugModeService: DebugModeService,
    private readonly luigiClient: LuigiClient,
    private readonly context: DxpLuigiContextService,
    private readonly policyService: PolicyService,
  ) {}

  async ngOnInit() {
    this.loading.set(true)
    await this.initializePipeline().finally(() => {
      this.loading.set(false)
    })

    const watchPipeline$ = this.pipelineService.watchPipeline().pipe(debounceTime(50))
    const watchNotManagedServices$ = this.pipelineService
      .watchNotManagedServicesInPipeline()
      .pipe(debounceTime(50)) as Observable<NotManagedServices>

    const watchGhActionsEnablement$ = this.githubActionsService.watchGithubActionsEnablement()
    this.watch$ = this.pipelineService
      .combinePipelineWithNotManagedServicesAndGithubWatch(
        watchPipeline$,
        watchNotManagedServices$,
        watchGhActionsEnablement$,
      )
      .pipe(
        debounceTime(50),
        map((pipeline) => {
          pipeline.resourceRefs.sort((a, b) => StepsOverallOrder[a.kind] - StepsOverallOrder[b.kind])
          return pipeline
        }),
      )
  }

  navigateToProjectMembers() {
    this.luigiClient.linkManager().navigate(`/projects/${this.context.getContext().projectId}/members`)
  }

  @HostListener('document:keydown.control.d', ['$event'])
  handleCtrlDEvent() {
    this.debugModeService.toggleDebugMode()
  }

  private async initializePipeline(): Promise<void> {
    if (await this.policyService.isUserStaffed()) {
      await firstValueFrom(
        this.pipelineService
          .createPipeline({
            pipelineType: this.pipelineType.FullPipeline,
          })
          .pipe(debounceTime(100)),
      )
    }

    this.pipelineAvail.next(true)
  }
}
