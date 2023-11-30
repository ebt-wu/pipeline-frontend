import { BuildTool, PipelineType } from '../generated/graphql'
import { CredentialTypes, Kinds, Orchestrators, ServiceStatus } from './enums'

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

export type ResourceRef = {
  error?: string
  name?: string
  kind?: Kinds
  status?: ServiceStatus
}

export type Pipeline = {
  name?: string
  pipelineType?: PipelineType
  resourceRefs?: ResourceRef[]
}
