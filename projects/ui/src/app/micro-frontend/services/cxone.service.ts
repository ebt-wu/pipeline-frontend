import { Injectable } from '@angular/core'
import { ApolloError } from '@apollo/client/errors'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import {
  BuildTool,
  CreateCxOneProjectMutation,
  CreateCxOneProjectMutationVariables,
  DeleteCxOneProjectMutation,
  DeleteCxOneProjectMutationVariables,
  GetCxOneApplicationQuery,
  GetCxOneApplicationQueryVariables,
  GetCxOneProjectQuery,
  GetCxOneProjectQueryVariables,
} from '@generated/graphql'
import { catchError, combineLatest, first, map, mergeMap, of } from 'rxjs'
import { BaseAPIService } from './base.service'
import { CREATE_CX_ONE_PROJECT, DELETE_CX_ONE_PROJECT, GET_CX_ONE_APPLICATION, GET_CX_ONE_PROJECT } from './queries'

@Injectable({ providedIn: 'root' })
export class CxOneService {
  constructor(
    private readonly apiService: BaseAPIService,
    private readonly luigiService: DxpLuigiContextService,
  ) {}

  getCxOneApplication() {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetCxOneApplicationQuery, GetCxOneApplicationQueryVariables>({
            query: GET_CX_ONE_APPLICATION,
            variables: {
              portalProjectId: ctx.context.projectId,
            },
            fetchPolicy: 'no-cache',
          })
          .pipe(
            map((res) => {
              if (!res.data.getCxOneApplication) {
                return null
              }
              if (!res.data.getCxOneApplication.applicationId) {
                return null
              }

              return res.data.getCxOneApplication
            }),
          )
          .pipe(
            catchError((err: ApolloError) => {
              if (err.graphQLErrors[0].message === 'CxOne app not found') {
                return of(null)
              }
              throw err
            }),
          )
      }),
    )
  }

  createCxOneProject(preset: string, buildTool: BuildTool) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreateCxOneProjectMutation, CreateCxOneProjectMutationVariables>({
            mutation: CREATE_CX_ONE_PROJECT,
            variables: {
              buildTool: buildTool,
              portalProjectId: ctx.context.projectId,
              portalComponentId: ctx.context.componentId,
              preset: preset,
            },
          })
          .pipe(map((res) => res.data.createCxOneProject ?? null))
      }),
    )
  }

  getCxOneProject(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .query<GetCxOneProjectQuery, GetCxOneProjectQueryVariables>({
            query: GET_CX_ONE_PROJECT,
            variables: {
              portalProjectId: ctx.context.projectId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data.getCxOneProject ?? null))
      }),
    )
  }

  deleteCxOneProject(resourceName: string) {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<DeleteCxOneProjectMutation, DeleteCxOneProjectMutationVariables>({
            mutation: DELETE_CX_ONE_PROJECT,
            variables: {
              portalProjectId: ctx.context.projectId,
              portalComponentId: ctx.context.componentId,
              resourceName: resourceName,
            },
          })
          .pipe(map((res) => res.data.deleteCxOneProject ?? null))
      }),
    )
  }
}
