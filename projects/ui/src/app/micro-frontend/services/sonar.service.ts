import { Injectable } from '@angular/core'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import {
  CreateSonarQubeProjectMutation,
  DeleteSonarQubeProjectMutation,
  GetSonarQubeProjectQuery,
  GetSonarQubeProjectQueryVariables,
} from '@generated/graphql'
import { DeletionPolicy } from '@generated/graphql'
import { combineLatest } from 'rxjs'
import { first, map, mergeMap } from 'rxjs/operators'
import { BaseAPIService } from './base.service'
import { CREATE_SONARQUBE_PROJECT, DELETE_SONARQUBE_PROJECT, GET_SONARQUBE_PROJECT } from './queries'

@Injectable({ providedIn: 'root' })
export class SonarService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createSonarqubeProject(projectName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client.mutate<CreateSonarQubeProjectMutation>({
          mutation: CREATE_SONARQUBE_PROJECT,
          variables: {
            projectId: ctx.context.projectId,
            componentId: ctx.context.componentId,
            projectName,
          },
        })
      }),
      map((result) => result.data?.createSonarQubeProject ?? null),
    )
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

  deleteSonarqubeProject(resourceName: string, deletionPolicy: DeletionPolicy = DeletionPolicy.Orphan) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client.mutate<DeleteSonarQubeProjectMutation>({
          mutation: DELETE_SONARQUBE_PROJECT,
          variables: {
            projectId: ctx.context.projectId,
            componentId: ctx.context.componentId,
            resourceName: resourceName,
            deletionPolicy: deletionPolicy,
          },
        })
      }),
      map((result) => result.data?.deleteSonarQubeProject ?? null),
    )
  }
}
