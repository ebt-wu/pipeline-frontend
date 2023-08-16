import { BuildTools, CredentialTypes, Orchestrators } from "./enums"

export type SetupBuildFormValue = {
    buildTool?: BuildTools
    buildToolHeader?: string 
    githubCredentialType?: CredentialTypes
    githubHeader?: string
    githubSelectCredential?: string
    githubToken?: string
    githubUserID?: string
    jenkinsCredentialType?: CredentialTypes
    jenkinsHeader?: string
    jenkinsSelectCredential?: string
    jenkinsToken?: string
    jenkinsUrl?: string
    jenkinsUserId?: string
    orchestrator?: Orchestrators
    orchestratorHeaders?: string
  }