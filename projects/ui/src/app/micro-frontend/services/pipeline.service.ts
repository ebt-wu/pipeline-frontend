import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { catchError, first, map, mergeMap } from 'rxjs/operators'
import { Observable, combineLatest, of } from 'rxjs'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { CREATE_PIPELINE, DELETE_PIPELINE, WATCH_PIPELINE } from './queries'
import { Pipeline, ResourceRef } from '@types'
import {
  CreatePipelineMutation,
  CreatePipelineMutationVariables,
  DeletePipelineMutation,
  DeletePipelineMutationVariables,
  PipelineCreationRequest,
  WatchPipelineSubscription,
  WatchPipelineSubscriptionVariables,
} from '@generated/graphql'
import { Kinds, ServiceStatus } from '@enums'

@Injectable({ providedIn: 'root' })
export class PipelineService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createPipeline(params: PipelineCreationRequest): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreatePipelineMutation, CreatePipelineMutationVariables>({
            mutation: CREATE_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              params: params,
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

  isBuildPipelineSetupAndCreated(resourceRefs: ResourceRef[]): boolean {
    return this.isBuildPipelineSetup(resourceRefs) && this.areResourcesCompletelyCreated(resourceRefs)
  }

  isBuildPipelineSetup(resourceRefs: ResourceRef[]): boolean {
    let isGithubRepositoryPresent = false
    let isPiperConfigPresent = false
    let isJenkinsPipelinePresent = false
    let isGithubActionsWorkflowPresent = false

    for (const ref of resourceRefs) {
      switch (ref.kind) {
        case Kinds.GITHUB_REPOSITORY: {
          isGithubRepositoryPresent = true
          break
        }
        case Kinds.PIPER_CONFIG: {
          isPiperConfigPresent = true
          break
        }
        case Kinds.JENKINS_PIPELINE: {
          isJenkinsPipelinePresent = true
          break
        }
        case Kinds.GITHUB_ACTIONS_WORKFLOW: {
          isGithubActionsWorkflowPresent = true
          break
        }
      }
    }

    const areRequiredResourcesPresent = isGithubRepositoryPresent && isPiperConfigPresent
    const isOrchestratorPresent = isJenkinsPipelinePresent || isGithubActionsWorkflowPresent

    return areRequiredResourcesPresent && isOrchestratorPresent
  }

  areResourcesCompletelyCreated(resourceRefs: ResourceRef[]): boolean {
    const isThereNotCreatedResource = resourceRefs.some((ref) => ref.status !== ServiceStatus.CREATED)
    return !isThereNotCreatedResource
  }
}
