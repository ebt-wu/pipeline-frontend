import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { catchError, first, map, mergeMap } from 'rxjs/operators'
import { Observable, combineLatest, of } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CREATE_PIPELINE, DELETE_PIPELINE, WATCH_PIPELINE } from './queries'
import { Pipeline } from 'src/app/types'
import {
  CreatePipelineMutation,
  CreatePipelineMutationVariables,
  DeletePipelineMutation,
  DeletePipelineMutationVariables,
  PipelineType,
  WatchPipelineSubscription,
  WatchPipelineSubscriptionVariables,
} from 'src/generated/graphql'

@Injectable({ providedIn: 'root' })
export class PipelineService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createPipeline(pipelineType: PipelineType): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreatePipelineMutation, CreatePipelineMutationVariables>({
            mutation: CREATE_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              pipelineType: pipelineType,
            },
          })
          .pipe(map((res) => res.data?.createPipeline ?? ''))
      }),
    )
  }

  deletePipeline(): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeletePipelineMutation, DeletePipelineMutationVariables>({
            mutation: DELETE_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(map((res) => res.data?.deletePipeline ?? ''))
      }),
    )
  }

  watchPipeline(): Observable<Pipeline> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .subscribe<WatchPipelineSubscription, WatchPipelineSubscriptionVariables>({
            query: WATCH_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
            },
          })
          .pipe(
            map((res) => res.data?.watchPipeline ?? {}),
            catchError(() => of({})),
          )
      }),
    )
  }
}
