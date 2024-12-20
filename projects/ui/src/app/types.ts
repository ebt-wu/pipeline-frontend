import { GitHubAdvancedSecurityGetPayload, NotManagedServices, PipelineType } from '@generated/graphql'
import { GithubInstances, JiraProjectTypes, Kinds, OSCPlatforms, ServiceStatus, StepKey, ValidationTools } from '@enums'

export type AddPrefixToTypeProperties<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K]
}

export type SetupOSCFormValue = {
  platform?: OSCPlatforms
  ppmsSoftwareComponentVersion?: string
  jiraProjectType?: JiraProjectTypes
  jiraExistingProjectKey?: string
}

export type ResourceRef = {
  error?: string
  name?: string
  kind?: Kinds | StepKey
  status?: ServiceStatus
}

export type Pipeline = {
  name?: string
  namespace?: string
  pipelineType?: PipelineType
  resourceRefs?: ResourceRef[]
  labels?: Label[]
  notManagedServices?: NotManagedServices
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

export interface CategoryConfig {
  configuredServicesText: string
  buttonConfig: {
    isButtonShown: boolean
    isButtonDisabled?: boolean
    disabledButtonInlineHelpText?: string
    buttonText?: string
    buttonAction?: () => void | Promise<void>
  }
  statusTagConfig?: {
    isStatusTagShown: boolean
    statusTagText: string
  }
  statusIconConfig?: {
    statusIconType: ServiceStatus
    statusIconInlineHelpText?: string
  }
  rightSideText?: string
  isOpenArrowShown?: boolean
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

export type GithubAdvancedSecurityServiceDetails = GitHubAdvancedSecurityGetPayload & {
  githubRepoName: string
  repoUrl: string
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceDetails = any
