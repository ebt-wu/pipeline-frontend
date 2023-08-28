import { BuildTools, CredentialTypes, Kinds, Orchestrators, PipelineType, ServiceStatus } from './enums'

export type SetupBuildFormValue = {
  buildTool?: BuildTools
  buildToolHeader?: string
  githubCredentialType?: CredentialTypes
  githubHeader?: string
  githubSelectCredential?: string
  githubToken?: string
  githubUserID?: string
  jenkinsCredentialType?: CredentialTypes
  jenkinsInstanceHeader?: string
  jenkinsCredentialHeader?: string
  jenkinsSelectCredential?: string
  jenkinsToken?: string
  jenkinsUrl?: string
  jenkinsUserId?: string
  orchestrator?: Orchestrators
  orchestratorHeaders?: string
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
