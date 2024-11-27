import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { combineLatest, first, map, mergeMap, Observable } from 'rxjs'
import { CREATE_PIPER_CONFIG, DELETE_PIPER_CONFIG, GET_PIPER_CONFIG } from './queries'
import {
  BuildTool,
  DeletePiperConfigMutation,
  DeletePiperConfigMutationVariables,
  GetPiperConfigQuery,
  GetPiperConfigQueryVariables,
  LabelInput,
} from '@generated/graphql'

@Injectable({ providedIn: 'root' })
export class PiperService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createPiperConfig(
    githubSecretRef: string | null,
    repositoryResource: string,
    buildTool: BuildTool,
    pipelineOptimization: boolean,
    dockerImageName: string,
    labels: Array<LabelInput> = [],
  ): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate({
            mutation: CREATE_PIPER_CONFIG,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              githubSecretRef: githubSecretRef,
              repositoryResource: repositoryResource,
              buildTool: buildTool,
              pipelineOptimization: pipelineOptimization,
              dockerImageName: dockerImageName,
              labels,
            },
          })
          .pipe(map((res) => res.data?.createPiperConfig ?? ''))
      }),
    )
  }

  getPiperConfig(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetPiperConfigQuery, GetPiperConfigQueryVariables>({
            query: GET_PIPER_CONFIG,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getPiperConfig ?? null))
      }),
    )
  }

  deletePiperConfig(resourceName: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeletePiperConfigMutation, DeletePiperConfigMutationVariables>({
            mutation: DELETE_PIPER_CONFIG,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.deletePiperConfig ?? ''))
      }),
    )
  }
}
