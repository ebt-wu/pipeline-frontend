import { Categories, Kinds } from './enums'
import { Extensions } from './micro-frontend/services/extension.types'

export const KindName = {
  [Kinds.CUMULUS_PIPELINE]: 'Cumulus',
  [Kinds.GITHUB_REPOSITORY]: 'GitHub Repository',
  [Kinds.PIPER_CONFIG]: 'Piper Native Build',
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 'Staging Service',
  [Kinds.JENKINS_PIPELINE]: 'Jenkins Pipeline',
  [Kinds.GITHUB_ACTION]: 'GitHub Actions',
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: 'GitHub Actions',
}

export const KindCategory = {
  [Kinds.CUMULUS_PIPELINE]: Categories.COMPLIANCE,
  [Kinds.GITHUB_REPOSITORY]: Categories.SOURCE_CODE_MANAGEMENT,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Categories.CODE_TRANSPORTATION,
  [Kinds.JENKINS_PIPELINE]: Categories.ORCHESTRATION,
  [Kinds.GITHUB_ACTION]: Categories.ORCHESTRATION,
  [Kinds.PIPER_CONFIG]: Categories.CODE_BUILD,
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: Categories.ORCHESTRATION,
}

export const KindExtensionName = {
  [Kinds.CUMULUS_PIPELINE]: Extensions.CUMULUS,
  [Kinds.GITHUB_REPOSITORY]: Extensions.GITHUB_TOOLS,
  [Kinds.GITHUB_ACTION]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
  [Kinds.PIPER_CONFIG]: Extensions.PIPER,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Extensions.STAGING_SERVICE_EXTERNAL,
  [Kinds.JENKINS_PIPELINE]: Extensions.JAAS,
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
}
