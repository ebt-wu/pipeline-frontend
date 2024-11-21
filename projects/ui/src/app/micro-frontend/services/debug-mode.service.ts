import { Injectable, signal } from '@angular/core'
import { MessageToastService } from '@fundamental-ngx/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, filter, first, map, mergeMap } from 'rxjs'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { Kinds } from '@enums'
import { FORCE_DEBUG_RECONCILIATION, TOGGLE_DEBUG_LABEL } from './queries'
import { BaseAPIService } from './base.service'

const ENV_MAPPING = {
  dev: 'dev',
  int: 'stage',
  live: 'prod',
}

export interface DxpToken extends JwtPayload {
  groups: string[]
}

@Injectable({ providedIn: 'root' })
export class DebugModeService {
  protected tier?: keyof typeof ENV_MAPPING
  debugModeEnabled = signal(false)
  isHyperspaceAdmin = signal(false)

  constructor(
    public messageToastService: MessageToastService,
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {
    this.luigiService
      .contextObservable()
      .pipe(
        map((c) => c.context),
        filter((c) => !!c.token),
      )
      .subscribe((ctx) => {
        const ADMIN_ARM_GROUP = `HyperCluster_Onboarding_${ENV_MAPPING[this.getTier()]}_Admin`.toLowerCase()
        const token = jwtDecode<DxpToken>(ctx.token)
        const isAdmin = token.groups.map((group) => group.toLowerCase()).includes(ADMIN_ARM_GROUP)
        this.isHyperspaceAdmin.set(isAdmin)
      })
  }

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

  openTraces(e: Event, namespace: string, resourceName?: string) {
    e?.stopPropagation()
    window.open(this.getTracesURL(namespace, resourceName), '_blank', 'noopener, noreferrer')
  }

  getTier(): keyof typeof ENV_MAPPING {
    if (this.tier) {
      return this.tier
    }
    const ctx = this.luigiService.getContext()
    this.tier = ctx.frameContext.automaticDServiceApiUrl.replace(
      /.*automaticd\.([^.]+)\.dxp\.k8s\.ondemand.com.*/,
      '$1',
    ) as keyof typeof ENV_MAPPING
    return this.tier
  }

  getTracesURL(namespace: string, resourceName?: string): string {
    const tier = this.getTier()
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

  // This will toggle the "automaticd.sap/debug" label for the currently acting user on the given resource
  toggleDebugLabel(kind: Kinds, name: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        const currentUserId = ctx.context.userid
        return client.mutate({
          mutation: TOGGLE_DEBUG_LABEL,
          variables: {
            projectId: ctx.context.projectId,
            kind: kind,
            resourceName: name,
            userId: currentUserId,
          },
        })
      }),
    )
  }
}
