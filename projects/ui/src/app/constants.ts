import { Categories, Kinds, Languages, Stages, StepKey } from '@enums'
import { Extensions } from './micro-frontend/services/extension.types'
import { ProgrammingLanguage } from '@types'

export const KindName = {
  [Kinds.CUMULUS_PIPELINE]: 'Cumulus',
  [Kinds.GITHUB_REPOSITORY]: 'GitHub Repository',
  [Kinds.PIPER_CONFIG]: 'Piper Native Build',
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 'Staging Service',
  [Kinds.JENKINS_PIPELINE]: 'Jenkins Pipeline',
  [Kinds.GITHUB_ACTIONS_ENABLEMENT]: 'GitHub Actions',
  [Kinds.GITHUB_ACTIONS_PIPELINE]: 'GitHub Actions',
  [Kinds.GITHUB_ADVANCED_SECURITY]: 'GitHub Advanced Security',
  [Kinds.CX_ONE_PROJECT]: 'Checkmarx ONE',
  [StepKey.CX_ONE]: 'Checkmarx ONE',
  [Kinds.SONAR_QUBE_PROJECT]: 'SonarQube',
  [Kinds.OPEN_SOURCE_COMPLIANCE]: 'Hyperspace Open-Source Compliance Service',
  [StepKey.AZURE_DEV_OPS]: 'Azure Pipelines',
  [StepKey.CNB]: 'Cloud Native Buildpacks',
  [StepKey.XMAKE]: 'xMake',
  [StepKey.COMMON_REPOSITORY]: 'Common Repository',
  [StepKey.BLACK_DUCK_HUB]: 'Black Duck Hub',
  [StepKey.CHECKMARX]: 'Checkmarx',
  [StepKey.FORTIFY]: 'Fortify',
  [StepKey.PPMS_FOSS]: 'PPMS FOSS',
  [StepKey.WHITE_SOURCE]: 'Mend',
  [StepKey.KUBERNETES]: 'Kubernetes',
  [StepKey.CLOUD_FOUNDRY]: 'Cloud Foundry',
}

export const KindCategory = {
  [Kinds.CUMULUS_PIPELINE]: Categories.COMPLIANCE,
  [Kinds.GITHUB_REPOSITORY]: Categories.SOURCE_CODE_MANAGEMENT,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Categories.CODE_TRANSPORTATION,
  [Kinds.JENKINS_PIPELINE]: Categories.ORCHESTRATION,
  [Kinds.PIPER_CONFIG]: Categories.CODE_BUILD,
  [Kinds.GITHUB_ACTIONS_ENABLEMENT]: Categories.AUTOMATE_WORKFLOWS,
  [Kinds.GITHUB_ACTIONS_PIPELINE]: Categories.ORCHESTRATION,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Categories.STATIC_SECURITY_CHECKS,
  [Kinds.CX_ONE_PROJECT]: Categories.STATIC_SECURITY_CHECKS,
  [StepKey.CX_ONE]: Categories.STATIC_SECURITY_CHECKS,
  [Kinds.OPEN_SOURCE_COMPLIANCE]: Categories.OPEN_SOURCE_CHECKS,
  [Kinds.SONAR_QUBE_PROJECT]: Categories.STATIC_CODE_CHECKS,
  [StepKey.AZURE_DEV_OPS]: Categories.ORCHESTRATION,
  [StepKey.CNB]: Categories.CONTAINER_IMAGE_CREATION,
  [StepKey.XMAKE]: Categories.CODE_BUILD,
  [StepKey.COMMON_REPOSITORY]: Categories.BINARY_MANAGEMENT,
  [StepKey.BLACK_DUCK_HUB]: Categories.OPEN_SOURCE_CHECKS,
  [StepKey.CHECKMARX]: Categories.STATIC_SECURITY_CHECKS,
  [StepKey.FORTIFY]: Categories.STATIC_SECURITY_CHECKS,
  [StepKey.PPMS_FOSS]: Categories.PRODUCT_MGMT_SYSTEM,
  [StepKey.WHITE_SOURCE]: Categories.OPEN_SOURCE_CHECKS,
  [StepKey.KUBERNETES]: Categories.DEPLOY,
  [StepKey.CLOUD_FOUNDRY]: Categories.DEPLOY,
}

export const KindExtensionName = {
  [Kinds.CUMULUS_PIPELINE]: Extensions.CUMULUS,
  [Kinds.GITHUB_REPOSITORY]: Extensions.GITHUB_TOOLS,
  [Kinds.PIPER_CONFIG]: Extensions.PIPER,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Extensions.STAGING_SERVICE_EXTERNAL,
  [Kinds.JENKINS_PIPELINE]: Extensions.JAAS,
  [Kinds.GITHUB_ACTIONS_ENABLEMENT]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
  [Kinds.GITHUB_ACTIONS_PIPELINE]: Extensions.GITHUB_ACTIONS_TOOLS_SAP,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Extensions.GITHUB_ADVANCED_SECURITY,
  [Kinds.OPEN_SOURCE_COMPLIANCE]: Extensions.OPEN_SOURCE_COMPLIANCE,
  [Kinds.SONAR_QUBE_PROJECT]: Extensions.SONARQUBE,
  [Kinds.CX_ONE_PROJECT]: Extensions.CHECKMARX_ONE,
  [StepKey.CX_ONE]: Extensions.CHECKMARX_ONE,
  [StepKey.AZURE_DEV_OPS]: Extensions.AZURE_PIPELINES,
  [StepKey.XMAKE]: Extensions.XMAKE,
  [StepKey.COMMON_REPOSITORY]: Extensions.ARTIFACTORY_INTERNET_FACING,
  [StepKey.BLACK_DUCK_HUB]: Extensions.BLACKDUCK,
  [StepKey.CHECKMARX]: Extensions.CHECKMARX,
  [StepKey.FORTIFY]: Extensions.FORTIFY,
  [StepKey.PPMS_FOSS]: Extensions.PPMS,
  [StepKey.WHITE_SOURCE]: Extensions.MEND,
}

export const KindStage = {
  [Kinds.CUMULUS_PIPELINE]: Stages.BUILD,
  [Kinds.GITHUB_REPOSITORY]: Stages.BUILD,
  [Kinds.PIPER_CONFIG]: Stages.BUILD,
  [Kinds.STAGING_SERVICE_CREDENTIAL]: Stages.BUILD,
  [Kinds.JENKINS_PIPELINE]: Stages.BUILD,
  [Kinds.GITHUB_ACTIONS_PIPELINE]: Stages.BUILD,
  [Kinds.GITHUB_ADVANCED_SECURITY]: Stages.VALIDATE,
  [Kinds.CX_ONE_PROJECT]: Stages.VALIDATE,
  [Kinds.OPEN_SOURCE_COMPLIANCE]: Stages.VALIDATE,
  [Kinds.SONAR_QUBE_PROJECT]: Stages.VALIDATE,
  [StepKey.AZURE_DEV_OPS]: Stages.BUILD,
  [StepKey.CNB]: Stages.BUILD,
  [StepKey.XMAKE]: Stages.BUILD,
  [StepKey.COMMON_REPOSITORY]: Stages.BUILD,
  [StepKey.BLACK_DUCK_HUB]: Stages.VALIDATE, // Open Source Checks - upgradable to OSC
  [StepKey.CHECKMARX]: Stages.VALIDATE, // Static Security Check - upgradable to GHAS/CxOne
  [StepKey.FORTIFY]: Stages.VALIDATE, // Static Security Check - upgradable to GHAS/CxOne
  [StepKey.CX_ONE]: Stages.VALIDATE,
  [StepKey.PPMS_FOSS]: Stages.BUILD,
  [StepKey.WHITE_SOURCE]: Stages.VALIDATE,
  [StepKey.KUBERNETES]: Stages.DEPLOY,
  [StepKey.CLOUD_FOUNDRY]: Stages.DEPLOY,
}

export const NotManagedServices = [
  StepKey.AZURE_DEV_OPS,
  StepKey.BLACK_DUCK_HUB,
  StepKey.CHECKMARX,
  StepKey.CNB,
  StepKey.COMMON_REPOSITORY,
  StepKey.FORTIFY,
  StepKey.PPMS_FOSS,
  StepKey.WHITE_SOURCE,
  StepKey.XMAKE,
  StepKey.CX_ONE,
  StepKey.KUBERNETES,
  StepKey.CLOUD_FOUNDRY,
]

export const ProgrammingLanguages: ProgrammingLanguage[] = [
  {
    id: Languages.JAVA,
    displayName: 'Java',
  },
  {
    id: Languages.JAVA_NODE_CAP,
    displayName: 'Java + Node CAP',
  },
  {
    id: Languages.JAVASCRIPT,
    displayName: 'JavaScript/TypeScript',
  },
  {
    id: Languages.PYTHON,
    displayName: 'Python',
  },
  {
    id: Languages.GO,
    displayName: 'Golang',
  },
  {
    id: Languages.RUBY,
    displayName: 'Ruby',
  },
  {
    id: Languages.GROOVY,
    displayName: 'Groovy',
  },
  {
    id: Languages.SCALA,
    displayName: 'Scala',
  },
  {
    id: Languages.SWIFT,
    displayName: 'Swift',
  },
  {
    id: Languages.PHP,
    displayName: 'PHP',
  },
  {
    id: Languages.OTHER,
    displayName: 'Other',
  },
]

export const OrderedStepsByCategory = {
  // Orchestrators
  [Kinds.JENKINS_PIPELINE]: 1,
  [Kinds.GITHUB_ACTIONS_PIPELINE]: 2,
  [StepKey.AZURE_DEV_OPS]: 3,

  // Code build
  [Kinds.PIPER_CONFIG]: 1,
  [StepKey.XMAKE]: 2,

  // Static Security Checks
  [Kinds.GITHUB_ADVANCED_SECURITY]: 1,
  [Kinds.CX_ONE_PROJECT]: 2,
  [StepKey.CX_ONE]: 3,
  [StepKey.CHECKMARX]: 4,
  [StepKey.FORTIFY]: 5,

  // Static Code Checks
  [Kinds.SONAR_QUBE_PROJECT]: 1,

  // Open Source Checks
  [Kinds.OPEN_SOURCE_COMPLIANCE]: 1,
  [StepKey.WHITE_SOURCE]: 2,
  [StepKey.BLACK_DUCK_HUB]: 3,

  // Deployment
  [StepKey.KUBERNETES]: 1,
  [StepKey.CLOUD_FOUNDRY]: 2,

  // Compliance
  [Kinds.CUMULUS_PIPELINE]: 1,

  // Source Code Management
  [Kinds.GITHUB_REPOSITORY]: 1,

  // Code Transportation
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 1,

  // Container Image Creation
  [StepKey.CNB]: 1,

  // Binary Management
  [StepKey.COMMON_REPOSITORY]: 1,

  // Product Management System
  [StepKey.PPMS_FOSS]: 1,
}

export const StepsOverallOrder = {
  [Kinds.FREESTYLE_PIPELINE]: 0,
  // BUILD
  // Orchestrators
  [Kinds.JENKINS_PIPELINE]: 1,
  [Kinds.GITHUB_ACTIONS_PIPELINE]: 2,
  [StepKey.AZURE_DEV_OPS]: 3,

  // Code build
  [Kinds.PIPER_CONFIG]: 5,
  [StepKey.XMAKE]: 6,

  // Source Code Management
  [Kinds.GITHUB_REPOSITORY]: 7,

  // Code Transportation
  [Kinds.STAGING_SERVICE_CREDENTIAL]: 8,

  // Compliance
  [Kinds.CUMULUS_PIPELINE]: 9,

  // Container Image Creation
  [StepKey.CNB]: 10,

  // Binary Management
  [StepKey.COMMON_REPOSITORY]: 11,

  // Product Management System
  [StepKey.PPMS_FOSS]: 12,

  // VALIDATION
  // Static Security Checks
  [Kinds.GITHUB_ADVANCED_SECURITY]: 13,
  [Kinds.CX_ONE_PROJECT]: 14,
  [StepKey.CX_ONE]: 15,
  [StepKey.CHECKMARX]: 16,
  [StepKey.FORTIFY]: 17,

  // Static Code Checks
  [Kinds.SONAR_QUBE_PROJECT]: 18,

  // Open Source Checks
  [Kinds.OPEN_SOURCE_COMPLIANCE]: 19,
  [StepKey.WHITE_SOURCE]: 20,
  [StepKey.BLACK_DUCK_HUB]: 21,

  // Deployment
  [StepKey.KUBERNETES]: 22,
  [StepKey.CLOUD_FOUNDRY]: 23,
}
