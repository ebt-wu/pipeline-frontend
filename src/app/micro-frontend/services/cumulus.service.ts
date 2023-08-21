import { Injectable } from '@angular/core'
import { APIService } from './api.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, first, map, mergeMap } from 'rxjs'
import { GET_CUMULUS_PIPELINE } from './queries'

export interface GetCumulusPipelineResponse {
  getCumulusPipeline: GetCumulusPipeline
}

export interface GetCumulusPipeline {
  id?: string
  key?: string
  creationTimestamp?: string
}

@Injectable({ providedIn: 'root' })
export class CumulusService {
  constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

  getCumulusPipeline(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetCumulusPipelineResponse>({
            query: GET_CUMULUS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getCumulusPipeline ?? null))
      })
    )
  }
}
