export enum Kinds {
  GITHUB_ACTION = 'GithubAction',
  GITHUB_REPOSITORY = 'GithubRepository',
  STAGING_SERVICE_CREDENTIAL = 'StagingServiceCredential',
  CUMULUS_PIPELINE = 'CumulusPipeline',
  PIPER_CONFIG = 'PiperConfig',
  JENKINS_PIPELINE = 'JenkinsPipeline',
  CUMULUS_GROUP = 'CumulusGroup',
}

export enum Categories {
  SOURCE_CODE_MANAGEMENT = 'Source Code Management',
  COMPLIANCE = 'Compliance Data Storage',
  CODE_TRANSPORTATION = 'Code Transportation',
  ORCHESTRATION = 'Orchestration',
  CODE_BUILD = 'Code Build',
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
  GITHUB_ACTIONS = 'Github Actions',
}

export enum CredentialTypes {
  EXISTING = 'Use Existing',
  NEW = 'Enter New',
}
