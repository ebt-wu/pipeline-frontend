import { Injectable } from '@angular/core'
import { CumulusService } from './cumulus.service'
import { CxOneService } from './cxone.service'
import { GithubActionsService } from './github-actions.service'
import { GithubAdvancedSecurityService } from './github-advanced-security.service'
import { GithubService } from './github.service'
import { JenkinsService } from './jenkins.service'
import { JiraService } from './jira.service'
import { OpenSourceComplianceService } from './open-source-compliance.service'
import { PiperService } from './piper.service'
import { SecretService } from './secret.service'
import { SonarService } from './sonar.service'
import { StagingServiceService } from './staging-service.service'

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(
    public readonly githubActionsService: GithubActionsService,
    public readonly githubService: GithubService,
    public readonly jenkinsService: JenkinsService,
    public readonly piperService: PiperService,
    public readonly cumulusService: CumulusService,
    public readonly secretService: SecretService,
    public readonly stagingServiceService: StagingServiceService,
    public readonly githubAdvancedSecurityService: GithubAdvancedSecurityService,
    public readonly openSourceComplianceService: OpenSourceComplianceService,
    public readonly sonarService: SonarService,
    public readonly jiraService: JiraService,
    public readonly cxOneService: CxOneService,
  ) {}
}
