import { combineLatest, first, map, mergeMap } from 'rxjs'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Injectable } from '@angular/core'
import { GET_STAGING_SERVICE_CREDENTIAL } from './queries'
import { GetStagingServiceCredentialQuery, GetStagingServiceCredentialQueryVariables } from '@generated/graphql'

@Injectable({ providedIn: 'root' })
export class StagingServiceService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  getStagingServiceCredential() {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetStagingServiceCredentialQuery, GetStagingServiceCredentialQueryVariables>({
            query: GET_STAGING_SERVICE_CREDENTIAL,
            variables: {
              projectId: ctx.context.projectId,
            },
          })
          .pipe(map((res) => res.data?.getStagingServiceCredential ?? null))
      }),
    )
  }
}
