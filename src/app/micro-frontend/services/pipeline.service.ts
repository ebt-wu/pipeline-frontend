import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi';
import { CREATE_PIPELINE, DELETE_PIPELINE, WATCH_PIPELINE } from './queries';
import { PipelineType } from 'src/app/constants';

export interface CreatePipelineResponse {
    createPipeline: string;
}

export interface DeletePipelineResponse {
    deletePipeline: string;
}

export interface WatchPipelineResponse {
    watchPipeline: Pipeline;
}

export interface Pipeline {
    name?: string;
    resourceRefs?: {
        kind?: string;
        status?: string;
        error?: string;
        name?: string
    }[];
}

@Injectable({ providedIn: 'root' })
export class PipelineService {
    constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

    createPipeline(pipelineType: PipelineType): Observable<string> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .mutate<CreatePipelineResponse>({
                        mutation: CREATE_PIPELINE,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                            pipelineType: pipelineType
                        },
                    })
                    .pipe(map((res) => res.data?.createPipeline ?? ''));
            })
        );
    }

    deletePipeline(): Observable<string> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .mutate<DeletePipelineResponse>({
                        mutation: DELETE_PIPELINE,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                        },
                    })
                    .pipe(map((res) => res.data?.deletePipeline ?? ''));
            })
        );
    }

    watchPipeline(): Observable<Pipeline> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .subscribe<WatchPipelineResponse>({
                        query: WATCH_PIPELINE,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                        },
                    })
                    .pipe(map((res) => res.data?.watchPipeline ?? {}));
            })
        );
    }
}
