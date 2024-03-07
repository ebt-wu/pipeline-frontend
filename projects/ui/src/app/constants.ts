import { Categories, Kinds, Stages, ValidationTools } from '@enums'
import { Extensions } from './micro-frontend/services/extension.types'
import { ValidationLanguage } from '@types'

export const KindName = {
  [Kinds.CUMULUS_PIPELINE]: 'Cumulus',
  [Kinds.GITHUB_REPOSITORY]: 'GitHub Repository',
  [Kinds.PIPER_CONFIG]: 'Piper Native Build',
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 'Staging Service',
  [Kinds.JENKINS_PIPELINE]: 'Jenkins Pipeline',
  [Kinds.GITHUB_ACTION]: 'GitHub Actions',
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: 'GitHub Actions',
  [Kinds.GITHUB_ADVANCED_SECURITY]: 'GitHub Advanced Security',
  [Kinds.CX_ONE]: 'CxOne',
}

export const KindCategory = {
  [Kinds.CUMULUS_PIPELINE]: Categories.COMPLIANCE,
  [Kinds.GITHUB_REPOSITORY]: Categories.SOURCE_CODE_MANAGEMENT,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Categories.CODE_TRANSPORTATION,
  [Kinds.JENKINS_PIPELINE]: Categories.ORCHESTRATION,
  [Kinds.GITHUB_ACTION]: Categories.ORCHESTRATION,
  [Kinds.PIPER_CONFIG]: Categories.CODE_BUILD,
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: Categories.ORCHESTRATION,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Categories.STATIC_SECURITY_CHECKS,
  [Kinds.CX_ONE]: Categories.STATIC_SECURITY_CHECKS,
}

export const KindExtensionName = {
  [Kinds.CUMULUS_PIPELINE]: Extensions.CUMULUS,
  [Kinds.GITHUB_REPOSITORY]: Extensions.GITHUB_TOOLS,
  [Kinds.GITHUB_ACTION]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
  [Kinds.PIPER_CONFIG]: Extensions.PIPER,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Extensions.STAGING_SERVICE_EXTERNAL,
  [Kinds.JENKINS_PIPELINE]: Extensions.JAAS,
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Extensions.GITHUB_ADVANCED_SECURITY,
}

export const KindStage = {
  [Kinds.CUMULUS_PIPELINE]: Stages.BUILD,
  [Kinds.GITHUB_REPOSITORY]: Stages.BUILD,
  [Kinds.PIPER_CONFIG]: Stages.BUILD,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Stages.BUILD,
  [Kinds.JENKINS_PIPELINE]: Stages.BUILD,
  [Kinds.GITHUB_ACTIONS_WORKFLOW]: Stages.BUILD,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Stages.VALIDATE,
}

export const ValidationLanguages: ValidationLanguage[] = [
  {
    id: 'java',
    displayName: 'Java',
    githubLinguistName: 'Java',
    order: 1,
    validationTool: ValidationTools.GHAS,
  },
  {
    id: 'javascript',
    displayName: 'JavaScript/TypeScript',
    githubLinguistName: 'JavaScript',
    order: 2,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'python',
    displayName: 'Python',
    githubLinguistName: 'Python',
    order: 3,
    validationTool: ValidationTools.GHAS,
  },
  {
    id: 'golang',
    displayName: 'Golang',
    githubLinguistName: 'Go',
    order: 4,
    validationTool: ValidationTools.CX,
  },
  // removed, see https://github.tools.sap/hyperspace/yggdrasil/issues/36#issuecomment-5601426
  // {
  //   id: 'csharp',
  //   displayName: 'C#',
  //   githubLinguistName: 'C#',
  //   order: 5,
  //   validationTool: ValidationTools.GHAS,
  // },
  {
    id: 'groovy',
    displayName: 'Groovy',
    githubLinguistName: 'Groovy',
    order: 6,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'ruby',
    displayName: 'Ruby',
    githubLinguistName: 'Ruby',
    order: 7,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'scala',
    displayName: 'Scala',
    githubLinguistName: 'Scala',
    order: 8,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'swift',
    displayName: 'Swift',
    githubLinguistName: 'Swift',
    order: 9,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'php',
    displayName: 'PHP',
    githubLinguistName: 'PHP',
    order: 10,
    validationTool: ValidationTools.CX,
  },
  {
    id: 'other',
    displayName: 'Other',
    githubLinguistName: '',
    order: 11,
  },
]
