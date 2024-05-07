import { Injectable, signal } from '@angular/core'
import { MessageToastService } from '@fundamental-ngx/core'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, first, mergeMap } from 'rxjs'
import { FORCE_DEBUG_RECONCILIATION } from './queries'

const ENV_MAPPING = {
  dev: 'dev',
  int: 'stage',
  live: 'prod',
}

@Injectable({ providedIn: 'root' })
export class DebugModeService {
  protected tier?: keyof typeof ENV_MAPPING
  debugModeEnabled = signal(false)

  constructor(
    public messageToastService: MessageToastService,
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  toggleDebugMode() {
    this.debugModeEnabled.set(!this.debugModeEnabled())

    let content = 'Debug mode enabled'
    if (!this.debugModeEnabled()) {
      content = 'Debug mode disabled'
    }

    this.messageToastService.open(content, {
      duration: 5000,
    })
  }

  forceDebugReconciliation(kind: string, resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client.mutate<void>({
          mutation: FORCE_DEBUG_RECONCILIATION,
          variables: {
            projectId: ctx.context.projectId,
            kind: kind,
            resourceName: resourceName,
          },
        })
      }),
    )
  }

  async openTraces(e: Event, namespace: string, resourceName?: string) {
    e?.stopPropagation()
    window.open(await this.getTracesURL(namespace, resourceName), '_blank')
  }

  async getTier(): Promise<keyof typeof ENV_MAPPING> {
    if (this.tier) {
      return this.tier
    }
    const ctx = await this.luigiService.getContextAsync()
    this.tier = ctx.frameContext.automaticDServiceApiUrl.replace(
      /.*automaticd\.([^.]+)\.dxp\.k8s\.ondemand.com.*/,
      '$1',
    ) as keyof typeof ENV_MAPPING
    return this.tier
  }

  async getTracesURL(namespace: string, resourceName?: string): Promise<string> {
    const tier = await this.getTier()
    const env = ENV_MAPPING[tier]

    const tagFilter = [
      { tag: 'sf_environment', operation: 'IN', values: [`u3300_automaticd-${env}`] },
      {
        tag: 'automaticd.resource.namespace',
        operation: 'IN',
        values: [namespace || 'default'],
      },
    ]
    if (resourceName) {
      tagFilter.push({
        tag: 'automaticd.resource.name',
        operation: 'IN',
        values: [resourceName],
      })
    }
    const filter = JSON.stringify({
      traceFilter: {
        tags: tagFilter,
      },
    })

    const searchParams = new URLSearchParams()
    searchParams.set('endTime', 'Now')
    searchParams.set('startTime', '-24h')

    return `https://sap.signalfx.com/#/apm/traces?filters=${filter}&${searchParams.toString()}`
  }
}
