import { Categories, Kinds } from './enums'
import { Extensions } from './micro-frontend/services/extension.types'

export const KindName = {
  [Kinds.CUMULUS_PIPELINE]: 'Cumulus',
  [Kinds.GITHUB_REPOSITORY]: 'GitHub Repository',
  [Kinds.PIPER_CONFIG]: 'Piper Native Build',
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 'Staging Service',
  [Kinds.JENKINS_PIPELINE]: 'Jenkins Pipeline',
}

export const KindCategory = {
  [Kinds.CUMULUS_PIPELINE]: Categories.COMPLIANCE,
  [Kinds.GITHUB_REPOSITORY]: Categories.SOURCE_CODE_MANAGEMENT,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Categories.CODE_TRANSPORTATION,
  [Kinds.JENKINS_PIPELINE]: Categories.ORCHESTRATION,
  [Kinds.PIPER_CONFIG]: Categories.CODE_BUILD,
}

export const KindExtensionName = {
  [Kinds.CUMULUS_PIPELINE]: Extensions.CUMULUS,
  [Kinds.GITHUB_REPOSITORY]: Extensions.GITHUB_TOOLS,
  [Kinds.PIPER_CONFIG]: Extensions.PIPER,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Extensions.STAGING_SERVICE_EXTERNAL,
  [Kinds.JENKINS_PIPELINE]: Extensions.JAAS,
}
