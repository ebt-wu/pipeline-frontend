import { Injectable } from '@angular/core'
import { APIService } from './api.service'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { BuildTools } from 'src/app/enums'
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs'
import { CREATE_PIPER_CONFIG } from './queries'

export interface CreatePiperConfigResponse {
  createPiperConfig: string
}

@Injectable({ providedIn: 'root' })
export class PiperService {
  constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

  createPiperConfig(
    githubSecretRef: string,
    repositoryResource: string,
    buildTool: BuildTools,
    pipelineOptimization: boolean,
    dockerImageName: string
  ): Observable<string> {
    return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
      first(),
      mergeMap(([client, ctx]) => {
        return client
          .mutate<CreatePiperConfigResponse>({
            mutation: CREATE_PIPER_CONFIG,
            variables: {
              projectId: ctx.context.projectId,
              componentId: ctx.context.componentId,
              githubSecretRef: githubSecretRef,
              repositoryResource: repositoryResource,
              buildTool: buildTool.toUpperCase(),
              pipelineOptimization: pipelineOptimization,
              dockerImageName: dockerImageName,
            },
          })
          .pipe(map((res) => res.data?.createPiperConfig ?? ''))
      })
    )
  }
}
