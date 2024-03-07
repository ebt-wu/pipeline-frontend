import { BuildTool, PipelineType } from '../generated/graphql'
import { CredentialTypes, Kinds, Orchestrators, ServiceStatus, ValidationTools } from './enums'

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
  namespace?: string
  pipelineType?: PipelineType
  resourceRefs?: ResourceRef[]
}

export type ValidationLanguage = {
  id: string
  displayName: string
  githubLinguistName: string
  order: number
  validationTool?: ValidationTools
}
export type ErrorMessage = {
  title: string
  message: string
}
