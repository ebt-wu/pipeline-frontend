import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { first, map, mergeMap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi';
import { GET_PIPELINE_SECRETS, WRITE_SECRET } from './queries';

export interface GetPipelineSecretsResponse {
    getPipelineSecrets: string[];
}

export interface WriteSecretResponse {
    writeSecret: string;
}

export interface SecretData {
    key: string;
    value: string;
}

@Injectable({ providedIn: 'root' })
export class SecretService {
    constructor(private readonly apiService: APIService, private readonly luigiService: DxpLuigiContextService) {}

    writeSecret(vaultPath: string, secretData: SecretData[]): Observable<string> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .mutate<WriteSecretResponse>({
                        mutation: WRITE_SECRET,
                        variables: {
                            projectId: ctx.context.projectId,
                            vaultPath: vaultPath,
                            data: secretData,
                        },
                    })
                    .pipe(map((res) => res.data?.writeSecret ?? ''));
            })
        );
    }

    getPipelineSecrets(): Observable<string[]> {
        return combineLatest([this.apiService.apollo(), this.luigiService.contextObservable()]).pipe(
            first(),
            mergeMap(([client, ctx]) => {
                return client
                    .query<GetPipelineSecretsResponse>({
                        query: GET_PIPELINE_SECRETS,
                        variables: {
                            projectId: ctx.context.projectId,
                            componentId: ctx.context.componentId,
                        },
                    })
                    .pipe(map((res) => res.data?.getPipelineSecrets ?? []));
            })
        );
    }
}
