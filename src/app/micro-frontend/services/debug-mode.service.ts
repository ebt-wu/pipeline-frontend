import { Injectable, signal } from '@angular/core'
import { MessageToastService } from '@fundamental-ngx/core'
import { APIService } from './api.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, first, mergeMap } from 'rxjs'
import { FORCE_DEBUG_RECONCILIATION } from './queries'

@Injectable({ providedIn: 'root' })
export class DebugModeService {
  constructor(
    public messageToastService: MessageToastService,
    private readonly apiService: APIService,
    private readonly luigiService: DxpLuigiContextService
  ) {}

  debugModeEnabled = signal(false)

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
      })
    )
  }
}
