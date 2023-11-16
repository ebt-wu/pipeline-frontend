import { Injectable } from '@angular/core'
import { BaseAPIService } from './base.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs'
import { CREATE_JENKINS_PIPELINE, DELETE_JENKINS_PIPELINE, GET_JENKINS_PIPELINE } from './queries'
import { DeletionPolicy } from '@enums'
import {
  CreateJenkinsPipelineMutation,
  CreateJenkinsPipelineMutationVariables,
  DeleteJenkinsPipelineMutation,
  GetJenkinsPipelineQuery,
  GetJenkinsPipelineQueryVariables,
} from '@generated/graphql'

@Injectable({ providedIn: 'root' })
export class JenkinsService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  createJenkinsPipeline(jenkinsUrl: string, secretPath: string, githubRepositoryResource: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateJenkinsPipelineMutation, CreateJenkinsPipelineMutationVariables>({
            mutation: CREATE_JENKINS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              jenkinsUrl: jenkinsUrl,
              jenkinsSecretPath: secretPath,
              githubRepositoryResource: githubRepositoryResource,
            },
          })
          .pipe(map((res) => res.data?.createJenkinsPipeline ?? ''))
      }),
    )
  }

  getJenkinsPipeline(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetJenkinsPipelineQuery, GetJenkinsPipelineQueryVariables>({
            query: GET_JENKINS_PIPELINE,
            fetchPolicy: 'no-cache',
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getJenkinsPipeline ?? null))
      }),
    )
  }

  deleteJenkinsPipeline(
    resourceName: string,
    deletionPolicy: DeletionPolicy = DeletionPolicy.ORPHAN,
  ): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteJenkinsPipelineMutation>({
            mutation: DELETE_JENKINS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              resourceName: resourceName,
              deletionPolicy: deletionPolicy,
            },
          })
          .pipe(map((res) => res.data?.deleteJenkinsPipeline ?? ''))
      }),
    )
  }
}
