import { Injectable } from '@angular/core';
import { CumulusService } from './cumulus.service';
import { GithubService } from './github.service';
import { JenkinsService } from './jenkins.service';
import { PiperService } from './piper.service';
import { StagingServiceService } from './staging-service.service';
import { SecretService } from './secret.service';

@Injectable({ providedIn: 'root' })
export class APIService {
    constructor(
        public readonly githubService: GithubService,
        public readonly jenkinsService: JenkinsService,
        public readonly piperService: PiperService,
        public readonly cumulusService: CumulusService,
        public readonly secretService: SecretService,
        public readonly stagingServiceService: StagingServiceService,
    ) { }
}