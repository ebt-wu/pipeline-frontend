import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, first, map, mergeMap } from 'rxjs'
import { GET_CUMULUS_PIPELINE } from './queries'
import { GetCumulusPipelineQuery, GetCumulusPipelineQueryVariables } from 'src/generated/graphql'

@Injectable({ providedIn: 'root' })
export class CumulusService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  getCumulusPipeline(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetCumulusPipelineQuery, GetCumulusPipelineQueryVariables>({
            query: GET_CUMULUS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getCumulusPipeline ?? null))
      }),
    )
  }
}
