import { Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { DxpLuigiContextService } from "@dxp/ngx-core/luigi";
import { Observable, combineLatest, first, map, mergeMap } from "rxjs";
import { CREATE_JENKINS_PIPELINE } from "./queries";

export interface CreateJenkinsPipelineResponse {
    createJenkinsPipeline: string;
}


@Injectable({providedIn: 'root'})
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
                .pipe(map((res) => res.data?.createJenkinsPipeline ?? ''));
            })
            
        )
    }
}