import { inject, Injectable } from '@angular/core'
import { ServiceStatus, StepKey } from '@enums'
import {
  CreatePipelineMutation,
  CreatePipelineMutationVariables,
  DeleteNotManagedServiceMutation,
  DeleteNotManagedServiceMutationVariables,
  DeletePipelineMutation,
  DeletePipelineMutationVariables,
  GithubActionsDetails,
  NotManagedServices,
  PipelineCreationRequest,
  Subscription,
  SubscriptionWatchNotManagedServicesArgs,
  WatchPipelineSubscription,
  WatchPipelineSubscriptionVariables,
} from '@generated/graphql'
import { Pipeline } from '@types'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { CONTEXT, CLIENT } from '../providers/app-state.provider'
import {
  CREATE_PIPELINE,
  DELETE_NOT_MANAGED_SERVICE,
  DELETE_PIPELINE,
  WATCH_NOT_MANAGED_SERVICES,
  WATCH_PIPELINE,
} from './queries'

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private readonly ctx = inject(CONTEXT)
  private readonly client = inject(CLIENT)

  createPipeline(params: PipelineCreationRequest): Observable<string> {
    return this.client
      .mutate<CreatePipelineMutation, CreatePipelineMutationVariables>({
        mutation: CREATE_PIPELINE,
        variables: {
          projectId: this.ctx.context.projectId,
          componentId: this.ctx.context.componentId,
          params: params,
        },
      })
      .pipe(map((res) => res.data?.createPipeline ?? ''))
  }

  deletePipeline(): Observable<string> {
    return this.client
      .mutate<DeletePipelineMutation, DeletePipelineMutationVariables>({
        mutation: DELETE_PIPELINE,
        variables: {
          projectId: this.ctx.context.projectId,
          componentId: this.ctx.context.componentId,
        },
      })
      .pipe(map((res) => res.data?.deletePipeline ?? ''))
  }

  deleteNotManagedService(stepKey: StepKey): Observable<string> {
    return this.client
      .mutate<DeleteNotManagedServiceMutation, DeleteNotManagedServiceMutationVariables>({
        mutation: DELETE_NOT_MANAGED_SERVICE,
        variables: {
          stepKey: stepKey,
          projectId: this.ctx.context.projectId,
          componentId: this.ctx.context.componentId,
        },
      })
      .pipe(map((res) => res.data?.deleteNotManagedService ?? ''))
  }

  watchPipeline(): Observable<Pipeline> {
    return this.client
      .subscribe<WatchPipelineSubscription, WatchPipelineSubscriptionVariables>({
        query: WATCH_PIPELINE,
        variables: {
          projectId: this.ctx.context.projectId,
          componentId: this.ctx.context.componentId,
        },
      })
      .pipe(
        map((res) => res.data?.watchPipeline ?? {}),
        catchError(() => of({})),
      )
  }

  watchNotManagedServicesInPipeline(): Observable<NotManagedServices | { error: string }> {
    return this.client
      .subscribe<Subscription, SubscriptionWatchNotManagedServicesArgs>({
        query: WATCH_NOT_MANAGED_SERVICES,
        variables: {
          projectId: this.ctx.context.projectId,
          componentId: this.ctx.context.componentId,
        },
      })
      .pipe(
        map((res) => {
          return res.data?.watchNotManagedServices
        }),
        catchError(() => {
          return of({ error: 'Failed at watch_not_managed_service(s)' })
        }),
      )
  }

  combinePipelineWithNotManagedServicesAndGithubWatch(
    watchPipeline$: Observable<Pipeline>,
    watchNotMangedServices$: Observable<NotManagedServices>,
    watchGithubActionsEnablement$: Observable<GithubActionsDetails>,
  ): Observable<Pipeline> {
    return combineLatest([watchPipeline$, watchNotMangedServices$, watchGithubActionsEnablement$]).pipe(
      map(([pipeline, notManagedServices, ghaDetails]) => {
        if (pipeline && pipeline.resourceRefs) {
          // Remove existing not managed services from pipeline resourceRefs
          pipeline.resourceRefs = pipeline.resourceRefs.filter(
            (element) => element.status !== ServiceStatus.NOT_MANAGED,
          )
          // Add current not managed services to pipeline resourceRefs
          const notManagedResourceRefs = Object.entries(notManagedServices)
            .filter(([, value]) => !!value)
            .map(([key]) => {
              return {
                kind: key as StepKey,
                status: ServiceStatus.NOT_MANAGED,
                error: null,
                name: '',
              }
            })
          pipeline.resourceRefs = [...pipeline.resourceRefs, ...notManagedResourceRefs]
        }
        // Return the updated pipeline with not managed services
        return { ...pipeline, notManagedServices, githubActionsDetails: ghaDetails }
      }),
    )
  }
}
