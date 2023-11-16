import { BuildTool, PipelineType } from '../generated/graphql'
import { CredentialTypes, Kinds, Orchestrators, ServiceStatus } from './enums'

export type SetupBuildFormValue = {
  buildTool?: BuildTool
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
