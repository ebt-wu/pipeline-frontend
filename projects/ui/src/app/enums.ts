export enum Kinds {
  GITHUB_ACTION = 'GithubAction',
  GITHUB_REPOSITORY = 'GithubRepository',
  STAGING_SERVICE_CREDENTIAL = 'StagingServiceCredential',
  CUMULUS_PIPELINE = 'CumulusPipeline',
  PIPER_CONFIG = 'PiperConfig',
  JENKINS_PIPELINE = 'JenkinsPipeline',
  CUMULUS_GROUP = 'CumulusGroup',
  GITHUB_ACTIONS_WORKFLOW = 'GithubActionsWorkflow',
  GITHUB_ADVANCED_SECURITY = 'GitHubAdvancedSecurity',
  CX_ONE = 'CxOne',
}

export enum Categories {
  SOURCE_CODE_MANAGEMENT = 'Source Code Management',
  COMPLIANCE = 'Compliance Data Storage',
  CODE_TRANSPORTATION = 'Code Transportation',
  ORCHESTRATION = 'Orchestration',
  CODE_BUILD = 'Code Build',
  STATIC_SECURITY_CHECKS = 'Static Security Checks',
  STATIC_CODE_CHECKS = 'Static Code Checks',
  OPEN_SOURCE_CHECKS = 'Open Source Checks',
}
export enum Stages {
  BUILD = 'BUILD',
  VALIDATE = 'VALIDATE',
  DEPLOY = 'DEPLOY',
}

export enum DeletionPolicy {
  DELETE = 'DELETE',
  ORPHAN = 'ORPHAN',
}

export enum ServiceStatus {
  CREATED = 'Created',
  PENDING_CREATION = 'PendingCreation',
  FAILING_CREATION = 'FailingCreation',
  NOT_FOUND = 'NotFound',
  UN_KNOWN = 'Unknown',
}

export enum Languages {
  JAVA = 'Java',
  GO = 'Go',
  TYPESCRIPT = 'TypeScript',
  JAVASCRIPT = 'JavaScript',
  PYTHON = 'Python',
  DOCKERFILE = 'Dockerfile',
}

export enum Orchestrators {
  JENKINS = 'Jenkins',
  AZURE_PIPELINES = 'Azure Pipelines',
  GITHUB_ACTIONS_WORKFLOW = 'GitHub Actions',
}

export enum CredentialTypes {
  EXISTING = 'Use Existing',
  NEW = 'Enter New',
}

export enum ValidationTools {
  GHAS = 'GitHub Advanced Security',
  CX = 'CxOne',
}
