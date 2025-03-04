import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { GetSonarQubeProjectQuery, GetSonarQubeProjectQueryVariables } from '@generated/graphql'
import { combineLatest } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import { BaseAPIService } from './base.service'
import { GET_SONARQUBE_PROJECT } from './queries'

@Injectable({ providedIn: 'root' })
export class SonarService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createSonarqubeProject() {
    // TODO: add once back-end implemention is there
  }

  getSonarqubeProject(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client.query<GetSonarQubeProjectQuery, GetSonarQubeProjectQueryVariables>({
          query: GET_SONARQUBE_PROJECT,
          variables: {
            projectId: ctx.context.projectId,
            resourceName: resourceName,
          },
          fetchPolicy: 'no-cache',
        })
      }),
      map((result) => result.data?.getSonarQubeProject ?? null),
    )
  }

  deleteSonarqubeProject() {
    // TODO: add once back-end implemention is there
  }
}
