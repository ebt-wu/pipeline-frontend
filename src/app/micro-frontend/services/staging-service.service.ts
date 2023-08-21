import { combineLatest, first, map, mergeMap } from 'rxjs'
import { APIService } from './api.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Injectable } from '@angular/core'
import { GET_STAGING_SERVICE_CREDENTIAL } from './queries'

export interface GetStagingServiceCredentialResponse {
  getStagingServiceCredential: GetStagingServiceCredential
}

export interface GetStagingServiceCredential {
  profileName?: string
  url?: string
  secretPath?: string
  creationTimestamp?: string
}

@Injectable({ providedIn: 'root' })
export class StagingServiceService {
  constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

  getStagingServiceCredential() {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetStagingServiceCredentialResponse>({
            query: GET_STAGING_SERVICE_CREDENTIAL,
            variables: {
              projectId: ctx.context.projectId,
            },
          })
          .pipe(map((res) => res.data?.getStagingServiceCredential ?? null))
      })
    )
  }
}
