import { GithubInstances, JiraProjectTypes, Kinds, OSCPlatforms, ServiceStatus, StepKey, Languages } from '@enums'
import { ButtonType, ColorAccent } from '@fundamental-ngx/core'
import {
  GithubActionsDetails,
  GitHubAdvancedSecurityGetPayload,
  NotManagedServices,
  PipelineType,
} from '@generated/graphql'

export type AddPrefixToTypeProperties<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K]
}

export interface SetupOSCFormValue {
  platform?: OSCPlatforms
  ppmsSoftwareComponentVersion?: string
  jiraProjectType?: JiraProjectTypes
  jiraExistingProjectKey?: string
}

export interface ResourceRef {
  error?: string
  name?: string
  kind?: Kinds | StepKey
  status?: ServiceStatus
}

export interface Pipeline {
  name?: string
  namespace?: string
  pipelineType?: PipelineType
  resourceRefs?: ResourceRef[]
  labels?: Label[]
  notManagedServices?: NotManagedServices
  githubActionsDetails?: GithubActionsDetails
}

export interface Label {
  key: string
  value: string
}

export interface EntityContext {
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
    buttonTestId?: string
    buttonText?: string
    buttonAction?: (e: Event) => void | Promise<void>
    buttonType?: ButtonType
  }
  infoIconConfig?: {
    isIconShown?: boolean
    iconInlineHelpText?: string
  }
  statusTagConfig?: {
    isStatusTagShown: boolean
    statusTagText: string
    statusTagBackgroundColor?: ColorAccent
    statusTagInlineHelpText?: string
  }
  statusIconConfig?: {
    statusIconType: string
    statusIconInlineHelpText?: string
  }
  rightSideTextConfig?: {
    rightSideText?: string
    rightSideTextInlineHelpText?: string
  }
  isOpenArrowShown?: boolean
}

export interface ProgrammingLanguage {
  id: Languages
  displayName: string
}

export interface GithubTokenMessage {
  value: string
  domain: GithubInstances
}

export interface ErrorMessage {
  title: string
  message: string
}

export type GithubAdvancedSecurityServiceDetails = GitHubAdvancedSecurityGetPayload & {
  githubRepoName: string
  repoUrl: string
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceDetails = any

export interface LanguageDetails {
  Name: string
  Bytes: number
}
export interface PullRequestData {
  title: string
}
export interface LanguageExtensionData {
  Languages: LanguageDetails[]
}

export interface RepositoryExtensionData {
  url: string
  openPullRequests: PullRequestData[]
}

export interface WatchComponentMetaResult {
  watchComponent: {
    extensions: {
      repository: RepositoryExtensionData
      languages: LanguageExtensionData
    }
  }
}
export interface ComponentMetaResult {
  component: {
    extensions: {
      repository: RepositoryExtensionData
      languages: LanguageExtensionData
    }
  }
}
