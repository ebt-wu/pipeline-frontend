import { Injectable } from '@angular/core'
import { APIService } from './api.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs'
import { CREATE_JENKINS_PIPELINE, DELETE_JENKINS_PIPELINE, GET_JENKINS_PIPELINE } from './queries'
import { DeletionPolicy } from 'src/app/enums'

export interface CreateJenkinsPipelineResponse {
  createJenkinsPipeline: string
}

export interface GetJenkinsPipelineResponse {
  getJenkinsPipeline: GetJenkinsPipeline
}

export interface GetJenkinsPipeline {
  name?: string
  jobUrl?: string
  secretPath?: string
  creationTimestamp?: string
}

export interface DeleteJenkinsPipelineResponse {
  deleteJenkinsPipeline: string
}

@Injectable({ providedIn: 'root' })
export class JenkinsService {
  constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

  createJenkinsPipeline(jenkinsUrl: string, secretPath: string, githubRepositoryResource: string): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateJenkinsPipelineResponse>({
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
      })
    )
  }

  getJenkinsPipeline(resourceName: string): Observable<GetJenkinsPipeline> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetJenkinsPipelineResponse>({
            query: GET_JENKINS_PIPELINE,
            fetchPolicy: "no-cache",
            variables: {
              projectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data?.getJenkinsPipeline ?? null))
      })
    )
  }

  deleteJenkinsPipeline(
    resourceName: string,
    deletionPolicy: DeletionPolicy = DeletionPolicy.ORPHAN
  ): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteJenkinsPipelineResponse>({
            mutation: DELETE_JENKINS_PIPELINE,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              resourceName: resourceName,
              deletionPolicy: deletionPolicy,
            },
          })
          .pipe(map((res) => res.data?.deleteJenkinsPipeline ?? ''))
      })
    )
  }
}
