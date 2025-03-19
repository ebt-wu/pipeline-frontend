export enum Extensions {
  GITHUB_WDF = 'git-hub-github-wdf-sap-corp',
  STAGING_SERVICE_EXTERNAL = 'staging-service-internet-facing',
  STAGING_SERVICE_INTERNAL = 'staging-service',
  CUMULUS = 'cumulus',
  BLACKDUCK_BINARY_ANALYSIS = 'blackduck-binary-analysis',
  ARTIFACTORY_INTERNET_FACING = 'artifactory-internet-facing',
  AUTOMATICD = 'automatic-d',
  PPMS = 'ppms-light',
  FORTIFY = 'fortify',
  SONARQUBE = 'sonarqube-enterprise',
  VAULT = 'hashicorp-vault-vault-tools-sap',
  CHECKMARX = 'checkmarx',
  MEND = 'mend',
  CHECKMARX_ONE = 'checkmarx-one',
  AZURE_PIPELINES = 'azure-pipelines',
  GITHUB_TOOLS = 'git-hub-github-tools-sap',
  GITHUB_ACTIONS_TOOLS_SAP = 'git-hub-actions-github-tools-sap',
  PIPER = 'piper',
  JAAS = 'jaas',
  GITHUB_ADVANCED_SECURITY = 'github-advanced-security-github-tools-sap',
  OPEN_SOURCE_COMPLIANCE = 'hyperspace-open-source-compliance-management',
  XMAKE = 'xmake',
  BLACKDUCK = 'blackduck-detect',
}

export interface ExtensionClass {
  name: string
  displayName: string
  description?: string
  icon?: Icon
  provider?: string
  image?: string // data:image/x;base64,
  documentation?: Documentation
  contacts?: Contact[]
  preferredSupportChannels?: Link[]
  serviceLevel?: ServiceLevel
}
export interface Contact {
  displayName: string
  email?: string
  role?: string[]
  contactLink?: string
}

export interface Link {
  displayName?: string
  URL?: string
}

export enum ServiceLevel {
  VeryHigh = 'veryHigh24x7',
  High = 'high24x5',
  MediumOne = 'mediumOne16x5',
  MediumTwo = 'mediumTwo12x5',
  Low = 'low8x5',
}

export interface Documentation {
  url?: string
}

export interface Icon {
  light: Image
  dark: Image
}

export interface Image {
  url?: string
  data?: string
}

export enum ScopeType {
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
  COMPONENT = 'COMPONENT',
  TENANT = 'TENANT',
  GLOBAL = 'GLOBAL',
}
