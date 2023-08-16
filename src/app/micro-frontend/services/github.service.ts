import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi';
import { CREATE_GITHUB_REPOSITORY, DELETE_GITHUB_REPOSITORY } from './queries';

export interface CreateGithubRepositoryResponse {
    createGithubRepository: string;
}

export interface DeleteGithubRepositoryResponse {
    deleteGithubRepository: string;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
    constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

    createGithubRepository(baseUrl: string, org: string, repo: string, secretPath: string): Observable<string> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .mutate<CreateGithubRepositoryResponse>({
                        mutation: CREATE_GITHUB_REPOSITORY,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                            baseUrl: baseUrl,
                            org: org,
                            repo: repo,
                            secretPath: secretPath,
                        },
                    })
                    .pipe(map((res) => res.data?.createGithubRepository ?? ''));
            })
        );
    }

    deleteGithubRepository(resourceName: string): Observable<string> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .mutate<DeleteGithubRepositoryResponse>({
                        mutation: DELETE_GITHUB_REPOSITORY,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                            resourceName: resourceName,
                        },
                    })
                    .pipe(map((res) => res.data?.deleteGithubRepository ?? ''));
            })
        );
    }
}
