import { ChangeDetectionStrategy, Component, HostListener, OnInit, signal } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { AsyncPipe, CommonModule } from '@angular/common'
import { PlatformDynamicPageModule } from '@fundamental-ngx/platform/dynamic-page'
import { FundamentalNgxCoreModule, SvgConfig } from '@fundamental-ngx/core'
import { ApolloModule } from 'apollo-angular'
import { PipelineService } from '../../services/pipeline.service'
import { BehaviorSubject, combineLatestWith, debounceTime, firstValueFrom, map, Observable } from 'rxjs'
import { PipelineComponent } from '../pipeline/pipeline.component'
import { Pipeline, ResourceRef } from '@types'
import { DebugModeService } from '../../services/debug-mode.service'
import { tntSpotSecret } from '../../../../assets/ts-svg/tnt-spot-secret'
import { AuthorizationModule } from '@dxp/ngx-core/authorization'
import { DxpLuigiContextService, LuigiClient } from '@dxp/ngx-core/luigi'
import { NotManagedServices, PipelineType } from '@generated/graphql'
import { PolicyService } from '../../services/policy.service'
import { ServiceStatus, StepKey } from '@enums'

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
    HttpClientModule,
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

    this.watch$ = watchPipeline$.pipe(
      combineLatestWith(watchNotManagedServices$),
      map(([pipeline, notManagedServices]) => {
        if (pipeline.resourceRefs) {
          for (const key of Object.keys(notManagedServices)) {
            if (notManagedServices[key] != null) {
              const notManagedService: ResourceRef = {
                kind: key as StepKey,
                status: ServiceStatus.NOT_MANAGED,
                error: null,
                name: '',
              }
              pipeline.resourceRefs.push(notManagedService)
            }
          }
        }
        return { ...pipeline, notManagedServices: notManagedServices }
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
    if (await this.policyService.canUserSetUpPipeline()) {
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
