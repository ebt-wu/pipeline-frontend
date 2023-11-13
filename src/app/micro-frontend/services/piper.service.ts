import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs'
import { CREATE_PIPER_CONFIG, DELETE_PIPER_CONFIG, GET_PIPER_CONFIG } from './queries'
import {
  BuildTool,
  CreatePiperConfigMutation,
  CreatePiperConfigMutationVariables,
  DeletePiperConfigMutation,
  DeletePiperConfigMutationVariables,
  GetPiperConfigQuery,
  GetPiperConfigQueryVariables,
} from 'src/generated/graphql'

@Injectable({ providedIn: 'root' })
export class PiperService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createPiperConfig(
    githubSecretRef: string,
    repositoryResource: string,
    buildTool: BuildTool,
    pipelineOptimization: boolean,
    dockerImageName: string,
  ): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreatePiperConfigMutation, CreatePiperConfigMutationVariables>({
            mutation: CREATE_PIPER_CONFIG,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              githubSecretRef: githubSecretRef,
              repositoryResource: repositoryResource,
              buildTool: buildTool,
              pipelineOptimization: pipelineOptimization,
              dockerImageName: dockerImageName,
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
