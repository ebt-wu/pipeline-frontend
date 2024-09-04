import { BuildTool, PipelineType } from '@generated/graphql'
import {
  CredentialTypes,
  GithubInstances,
  JiraProjectTypes,
  Kinds,
  Orchestrators,
  OSCPlatforms,
  ServiceStatus,
  ValidationTools,
} from '@enums'

export type ghTokenFormValue = {
  githubToken?: string
  githubCredentialType?: CredentialTypes
  githubSelectCredential?: string
}

export type SetupBuildFormValue = {
  buildTool?: BuildTool
  buildToolHeader?: string
  githubCredentialType?: CredentialTypes
  githubHeaderGithubActions?: void
  githubHeaderJenkins?: void
  githubSelectCredential?: string
  githubToken?: string
  jenkinsCredentialType?: CredentialTypes
  jenkinsInstanceHeader?: void
  jenkinsCredentialHeader?: void
  jenkinsSelectCredential?: string
  jenkinsToken?: string
  jenkinsUrl?: string
  jenkinsUserId?: string
  orchestrator?: Orchestrators
  orchestratorHeader?: void
  patInfoBox?: void
}

export type SetupOSCFormValue = {
  platform?: OSCPlatforms
  ppmsSoftwareComponentVersion?: string
  jiraProjectType?: JiraProjectTypes
}

export type ResourceRef = {
  error?: string
  name?: string
  kind?: Kinds
  status?: ServiceStatus
}

export type Pipeline = {
  name?: string
  namespace?: string
  pipelineType?: PipelineType
  resourceRefs?: ResourceRef[]
  labels?: Label[]
}

export type Label = {
  key: string
  value: string
}

export type EntityContext = {
  component: {
    annotations: {
      ['github.dxp.sap.com/acronym']: string
      ['github.dxp.sap.com/login']: string
      ['github.dxp.sap.com/repo-name']: string
      ['github.dxp.sap.com/repo-url']: string
    }
  }
}

export type ValidationLanguage = {
  id: string
  displayName: string
  githubLinguistNames: string[]
  order: number
  validationTool?: ValidationTools
}

export type GithubTokenMessage = {
  value: string
  domain: GithubInstances
}

export type ErrorMessage = {
  title: string
  message: string
}
