export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AutomaticdInput = {
  githubUrl: Scalars['String']['input'];
  secretName?: InputMaybe<Scalars['String']['input']>;
  useDynamicNamespace?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum BuildTool {
  Docker = 'DOCKER',
  Golang = 'GOLANG',
  Gradle = 'GRADLE',
  Maven = 'MAVEN',
  Mta = 'MTA',
  Npm = 'NPM',
  Python = 'PYTHON'
}

export type CumulusPipeline = {
  __typename?: 'CumulusPipeline';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['String']['output']>;
  groupKey?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
};

export enum DeletionPolicy {
  Delete = 'DELETE',
  Orphan = 'ORPHAN'
}

export type GitHubAdvancedSecurityCreatePayload = {
  buildTool?: InputMaybe<BuildTool>;
  codeScanJobOrchestrator?: InputMaybe<Orchestrators>;
  githubInstance: Scalars['String']['input'];
  githubOrganization: Scalars['String']['input'];
  githubRepository: Scalars['String']['input'];
  labels?: InputMaybe<Array<LabelInput>>;
};

export type GitHubAdvancedSecurityGetPayload = {
  __typename?: 'GitHubAdvancedSecurityGetPayload';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  githubInstance: Scalars['String']['output'];
  githubOrganization: Scalars['String']['output'];
};

export type GithubActionsCreatePayload = {
  githubInstance: Scalars['String']['input'];
  githubOrganization: Scalars['String']['input'];
  secretPath: Scalars['String']['input'];
};

export type GithubActionsGetPayload = {
  __typename?: 'GithubActionsGetPayload';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  githubInstance?: Maybe<Scalars['String']['output']>;
  githubOrganization?: Maybe<Scalars['String']['output']>;
  isAlreadyManaged: Scalars['Boolean']['output'];
  responsibleProject?: Maybe<Scalars['String']['output']>;
  secretPath?: Maybe<Scalars['String']['output']>;
  solinasCustomerID?: Maybe<Scalars['String']['output']>;
};

export type GithubCreationRequest = {
  baseUrl?: InputMaybe<Scalars['String']['input']>;
  isGithubActionsGPP?: InputMaybe<Scalars['Boolean']['input']>;
  org: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  secretPath?: InputMaybe<Scalars['String']['input']>;
};

export type GithubRepository = {
  __typename?: 'GithubRepository';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  organization?: Maybe<Scalars['String']['output']>;
  repository?: Maybe<Scalars['String']['output']>;
  repositoryUrl?: Maybe<Scalars['String']['output']>;
  secretPath?: Maybe<Scalars['String']['output']>;
};

export type Group = {
  __typename?: 'Group';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type JenkinsCreationRequest = {
  githubRepositoryResource: Scalars['String']['input'];
  jenkinsSecretPath: Scalars['String']['input'];
  jenkinsUrl: Scalars['String']['input'];
  labels?: InputMaybe<Array<LabelInput>>;
};

export type JenkinsPipeline = {
  __typename?: 'JenkinsPipeline';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  jobUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  secretPath?: Maybe<Scalars['String']['output']>;
};

export type JiraProject = {
  __typename?: 'JiraProject';
  jiraInstanceUrl?: Maybe<Scalars['String']['output']>;
  projectKey?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
};

export type Label = {
  __typename?: 'Label';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type LabelInput = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCumulusPipeline?: Maybe<Scalars['String']['output']>;
  createGitHubAdvancedSecurity?: Maybe<Scalars['String']['output']>;
  createGithubActions?: Maybe<Scalars['String']['output']>;
  createGithubRepository?: Maybe<Scalars['String']['output']>;
  createJenkinsPipeline?: Maybe<Scalars['String']['output']>;
  createOscRegistration?: Maybe<Scalars['String']['output']>;
  createPipeline: Scalars['String']['output'];
  createPiperConfig?: Maybe<Scalars['String']['output']>;
  deleteCumulusPipeline?: Maybe<Scalars['String']['output']>;
  deleteGitHubAdvancedSecurity?: Maybe<Scalars['String']['output']>;
  deleteGithubActions?: Maybe<Scalars['String']['output']>;
  deleteGithubRepository?: Maybe<Scalars['String']['output']>;
  deleteJenkinsPipeline?: Maybe<Scalars['String']['output']>;
  deleteOscRegistration?: Maybe<Scalars['String']['output']>;
  deletePipeline?: Maybe<Scalars['String']['output']>;
  deletePiperConfig?: Maybe<Scalars['String']['output']>;
  ensureVaultOnboarding: VaultOnboardingInfo;
  forceDebugReconciliation?: Maybe<Scalars['String']['output']>;
  provideTokenToAutomaticd: Scalars['String']['output'];
  removeStagingServiceCredential?: Maybe<Scalars['String']['output']>;
  writeSecret?: Maybe<Scalars['String']['output']>;
};


export type MutationCreateCumulusPipelineArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type MutationCreateGitHubAdvancedSecurityArgs = {
  componentId: Scalars['String']['input'];
  params: GitHubAdvancedSecurityCreatePayload;
  projectId: Scalars['String']['input'];
};


export type MutationCreateGithubActionsArgs = {
  componentId: Scalars['String']['input'];
  params: GithubActionsCreatePayload;
  projectId: Scalars['String']['input'];
};


export type MutationCreateGithubRepositoryArgs = {
  componentId: Scalars['String']['input'];
  params: GithubCreationRequest;
  projectId: Scalars['String']['input'];
};


export type MutationCreateJenkinsPipelineArgs = {
  componentId: Scalars['String']['input'];
  params: JenkinsCreationRequest;
  projectId: Scalars['String']['input'];
};


export type MutationCreateOscRegistrationArgs = {
  componentId: Scalars['String']['input'];
  params?: InputMaybe<OpenSourceComplianceCreatePayload>;
  projectId: Scalars['String']['input'];
};


export type MutationCreatePipelineArgs = {
  componentId: Scalars['String']['input'];
  params: PipelineCreationRequest;
  projectId: Scalars['String']['input'];
};


export type MutationCreatePiperConfigArgs = {
  componentId: Scalars['String']['input'];
  params: PiperConfigCreationRequest;
  projectId: Scalars['String']['input'];
};


export type MutationDeleteCumulusPipelineArgs = {
  componentId: Scalars['String']['input'];
  deletionPolicy?: InputMaybe<DeletionPolicy>;
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationDeleteGitHubAdvancedSecurityArgs = {
  deletionPolicy?: InputMaybe<DeletionPolicy>;
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationDeleteGithubActionsArgs = {
  componentId: Scalars['String']['input'];
  deletionPolicy?: InputMaybe<DeletionPolicy>;
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationDeleteGithubRepositoryArgs = {
  componentId: Scalars['String']['input'];
  deletionPolicy?: InputMaybe<DeletionPolicy>;
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationDeleteJenkinsPipelineArgs = {
  componentId: Scalars['String']['input'];
  deletionPolicy?: InputMaybe<DeletionPolicy>;
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationDeleteOscRegistrationArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type MutationDeletePipelineArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type MutationDeletePiperConfigArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationEnsureVaultOnboardingArgs = {
  projectId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationForceDebugReconciliationArgs = {
  kind: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type MutationProvideTokenToAutomaticdArgs = {
  automaticdInput: AutomaticdInput;
  projectId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveStagingServiceCredentialArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type MutationWriteSecretArgs = {
  data: Array<SecretData>;
  projectId: Scalars['String']['input'];
  vaultPath: Scalars['String']['input'];
};

export type OpenSourceComplianceCreatePayload = {
  githubInfo?: InputMaybe<GithubCreationRequest>;
  jira?: InputMaybe<Scalars['String']['input']>;
  ppmsScv?: InputMaybe<Scalars['String']['input']>;
};

export type OpenSourceComplianceGetResponse = {
  __typename?: 'OpenSourceComplianceGetResponse';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  cumulusPipelineId: Scalars['String']['output'];
  ghRepoRef?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  jiraRef?: Maybe<Scalars['String']['output']>;
  oscResourceName: Scalars['String']['output'];
  ppmsScv?: Maybe<Scalars['String']['output']>;
};

export enum Orchestrators {
  AzurePipelines = 'AzurePipelines',
  GitHubActions = 'GitHubActions',
  Jenkins = 'Jenkins'
}

export type Pipeline = {
  __typename?: 'Pipeline';
  automaticdClientName: Scalars['String']['output'];
  automaticdClientNamespace: Scalars['String']['output'];
  labels: Array<Label>;
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  pipelineType: PipelineType;
  resourceRefs?: Maybe<Array<ResourceRef>>;
};

export type PipelineCreationRequest = {
  labels?: InputMaybe<Array<LabelInput>>;
  pipelineType?: InputMaybe<PipelineType>;
};

export enum PipelineType {
  FullPipeline = 'FULL_PIPELINE',
  SingleService = 'SINGLE_SERVICE'
}

export type PiperConfig = {
  __typename?: 'PiperConfig';
  configString?: Maybe<Scalars['String']['output']>;
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  pullRequestURL?: Maybe<Scalars['String']['output']>;
};

export type PiperConfigCreationRequest = {
  githubSecretRef: Scalars['String']['input'];
  labels?: InputMaybe<Array<LabelInput>>;
  repositoryResource: Scalars['String']['input'];
  templateArgs?: InputMaybe<PiperTemplateArgs>;
};

export type PiperTemplateArgs = {
  general: PiperTemplateArgsGeneral;
  stagingService?: InputMaybe<PiperTemplateArgsStagingService>;
};

export type PiperTemplateArgsGeneral = {
  buildTool: BuildTool;
  pipelineOptimization: Scalars['Boolean']['input'];
};

export type PiperTemplateArgsStagingService = {
  dockerImageName?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getCumulusPipeline?: Maybe<CumulusPipeline>;
  getGitHubAdvancedSecurity?: Maybe<GitHubAdvancedSecurityGetPayload>;
  getGithubActionsCrossNamespace?: Maybe<GithubActionsGetPayload>;
  getGithubRepository?: Maybe<GithubRepository>;
  getJenkinsPipeline?: Maybe<JenkinsPipeline>;
  getJiraProjects?: Maybe<Array<Maybe<JiraProject>>>;
  getOscRegistration?: Maybe<OpenSourceComplianceGetResponse>;
  getPipelineSecrets?: Maybe<Array<Secret>>;
  getPiperConfig: PiperConfig;
  getStagingServiceCredential?: Maybe<StagingServiceCredential>;
  onboardingGroups: Array<Maybe<Group>>;
};


export type QueryGetCumulusPipelineArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetGitHubAdvancedSecurityArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetGithubActionsCrossNamespaceArgs = {
  githubInstance: Scalars['String']['input'];
  githubOrg: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryGetGithubRepositoryArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetJenkinsPipelineArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetJiraProjectsArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryGetOscRegistrationArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryGetPipelineSecretsArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryGetPiperConfigArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetStagingServiceCredentialArgs = {
  projectId: Scalars['String']['input'];
};

export type ResourceRef = {
  __typename?: 'ResourceRef';
  automaticdErrorNumber: Scalars['String']['output'];
  error: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type Secret = {
  __typename?: 'Secret';
  metadata?: Maybe<SecretMetadata>;
  path: Scalars['String']['output'];
};

export type SecretData = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type SecretMetadata = {
  __typename?: 'SecretMetadata';
  scopes?: Maybe<Scalars['String']['output']>;
};

export type StagingServiceCredential = {
  __typename?: 'StagingServiceCredential';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  profileName?: Maybe<Scalars['String']['output']>;
  secretPath?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  watchPipeline: Pipeline;
};


export type SubscriptionWatchPipelineArgs = {
  componentId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};

export type VaultOnboardingInfo = {
  __typename?: 'VaultOnboardingInfo';
  token: Scalars['String']['output'];
  vaultUrl: Scalars['String']['output'];
};

export type CreatePipelineMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  params: PipelineCreationRequest;
}>;


export type CreatePipelineMutation = { __typename?: 'Mutation', createPipeline: string };

export type DeletePipelineMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type DeletePipelineMutation = { __typename?: 'Mutation', deletePipeline?: string | null };

export type WatchPipelineSubscriptionVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type WatchPipelineSubscription = { __typename?: 'Subscription', watchPipeline: { __typename?: 'Pipeline', name: string, pipelineType: PipelineType, namespace: string, automaticdClientName: string, automaticdClientNamespace: string, labels: Array<{ __typename?: 'Label', key: string, value: string }>, resourceRefs?: Array<{ __typename?: 'ResourceRef', kind: string, status: string, error: string, name: string }> | null } };

export type WriteSecretMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  vaultPath: Scalars['String']['input'];
  data: Array<SecretData> | SecretData;
}>;


export type WriteSecretMutation = { __typename?: 'Mutation', writeSecret?: string | null };

export type GetPipelineSecretsQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type GetPipelineSecretsQuery = { __typename?: 'Query', getPipelineSecrets?: Array<{ __typename?: 'Secret', path: string, metadata?: { __typename?: 'SecretMetadata', scopes?: string | null } | null }> | null };

export type CreateGithubRepositoryMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  baseUrl: Scalars['String']['input'];
  org: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  secretPath: Scalars['String']['input'];
  isGithubActionsGPP: Scalars['Boolean']['input'];
}>;


export type CreateGithubRepositoryMutation = { __typename?: 'Mutation', createGithubRepository?: string | null };

export type DeleteGithubRepositoryMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type DeleteGithubRepositoryMutation = { __typename?: 'Mutation', deleteGithubRepository?: string | null };

export type GetGithubRepositoryQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type GetGithubRepositoryQuery = { __typename?: 'Query', getGithubRepository?: { __typename?: 'GithubRepository', repository?: string | null, organization?: string | null, repositoryUrl?: string | null, secretPath?: string | null, creationTimestamp?: string | null } | null };

export type DeleteCumulusPipelineMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type DeleteCumulusPipelineMutation = { __typename?: 'Mutation', deleteCumulusPipeline?: string | null };

export type GetCumulusPipelineQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type GetCumulusPipelineQuery = { __typename?: 'Query', getCumulusPipeline?: { __typename?: 'CumulusPipeline', id?: string | null, key?: string | null, creationTimestamp?: string | null, groupId?: string | null, groupKey?: string | null } | null };

export type RemoveStagingServiceCredentialMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type RemoveStagingServiceCredentialMutation = { __typename?: 'Mutation', removeStagingServiceCredential?: string | null };

export type GetStagingServiceCredentialQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
}>;


export type GetStagingServiceCredentialQuery = { __typename?: 'Query', getStagingServiceCredential?: { __typename?: 'StagingServiceCredential', profileName?: string | null, url?: string | null, secretPath?: string | null, creationTimestamp?: string | null } | null };

export type CreateJenkinsPipelineMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  jenkinsUrl: Scalars['String']['input'];
  jenkinsSecretPath: Scalars['String']['input'];
  githubRepositoryResource: Scalars['String']['input'];
  labels?: InputMaybe<Array<LabelInput> | LabelInput>;
}>;


export type CreateJenkinsPipelineMutation = { __typename?: 'Mutation', createJenkinsPipeline?: string | null };

export type GetJenkinsPipelineQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type GetJenkinsPipelineQuery = { __typename?: 'Query', getJenkinsPipeline?: { __typename?: 'JenkinsPipeline', name?: string | null, jobUrl?: string | null, secretPath?: string | null, creationTimestamp?: string | null } | null };

export type DeleteJenkinsPipelineMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
  deletionPolicy?: InputMaybe<DeletionPolicy>;
}>;


export type DeleteJenkinsPipelineMutation = { __typename?: 'Mutation', deleteJenkinsPipeline?: string | null };

export type CreatePiperConfigMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  githubSecretRef: Scalars['String']['input'];
  repositoryResource: Scalars['String']['input'];
  buildTool: BuildTool;
  pipelineOptimization: Scalars['Boolean']['input'];
  dockerImageName?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<LabelInput> | LabelInput>;
}>;


export type CreatePiperConfigMutation = { __typename?: 'Mutation', createPiperConfig?: string | null };

export type GetPiperConfigQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type GetPiperConfigQuery = { __typename?: 'Query', getPiperConfig: { __typename?: 'PiperConfig', pullRequestURL?: string | null, configString?: string | null, creationTimestamp?: string | null } };

export type DeletePiperConfigMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type DeletePiperConfigMutation = { __typename?: 'Mutation', deletePiperConfig?: string | null };

export type EnsureVaultOnboardingMutationVariables = Exact<{
  tenantId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
}>;


export type EnsureVaultOnboardingMutation = { __typename?: 'Mutation', ensureVaultOnboarding: { __typename?: 'VaultOnboardingInfo', token: string, vaultUrl: string } };

export type ForceDebugReconciliationMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type ForceDebugReconciliationMutation = { __typename?: 'Mutation', forceDebugReconciliation?: string | null };

export type CreateGithubActionsMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  githubInstance: Scalars['String']['input'];
  githubOrganization: Scalars['String']['input'];
  secretPath: Scalars['String']['input'];
}>;


export type CreateGithubActionsMutation = { __typename?: 'Mutation', createGithubActions?: string | null };

export type DeleteGithubActionsMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type DeleteGithubActionsMutation = { __typename?: 'Mutation', deleteGithubActions?: string | null };

export type GetGithubActionsCrossNamespaceQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  githubOrg: Scalars['String']['input'];
  githubInstance: Scalars['String']['input'];
}>;


export type GetGithubActionsCrossNamespaceQuery = { __typename?: 'Query', getGithubActionsCrossNamespace?: { __typename?: 'GithubActionsGetPayload', solinasCustomerID?: string | null, githubOrganization?: string | null, githubInstance?: string | null, secretPath?: string | null, creationTimestamp?: string | null, isAlreadyManaged: boolean, responsibleProject?: string | null } | null };

export type CreateGitHubAdvancedSecurityMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  githubInstance: Scalars['String']['input'];
  githubOrganization: Scalars['String']['input'];
  githubRepository: Scalars['String']['input'];
  codeScanJobOrchestrator?: InputMaybe<Orchestrators>;
  buildTool?: InputMaybe<BuildTool>;
  labels?: InputMaybe<Array<LabelInput> | LabelInput>;
}>;


export type CreateGitHubAdvancedSecurityMutation = { __typename?: 'Mutation', createGitHubAdvancedSecurity?: string | null };

export type GetGitHubAdvancedSecurityQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type GetGitHubAdvancedSecurityQuery = { __typename?: 'Query', getGitHubAdvancedSecurity?: { __typename?: 'GitHubAdvancedSecurityGetPayload', githubInstance: string, githubOrganization: string, creationTimestamp?: string | null } | null };

export type DeleteGitHubAdvancedSecurityMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}>;


export type DeleteGitHubAdvancedSecurityMutation = { __typename?: 'Mutation', deleteGitHubAdvancedSecurity?: string | null };

export type CreateOscRegistrationMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  jira?: InputMaybe<Scalars['String']['input']>;
  ppmsScv?: InputMaybe<Scalars['String']['input']>;
  githubBaseUrl: Scalars['String']['input'];
  githubOrg: Scalars['String']['input'];
  githubRepo: Scalars['String']['input'];
  githubSecretPath: Scalars['String']['input'];
  isGithubActionsGPP: Scalars['Boolean']['input'];
}>;


export type CreateOscRegistrationMutation = { __typename?: 'Mutation', createOscRegistration?: string | null };

export type GetOscRegistrationQueryVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type GetOscRegistrationQuery = { __typename?: 'Query', getOscRegistration?: { __typename?: 'OpenSourceComplianceGetResponse', oscResourceName: string, cumulusPipelineId: string, isActive?: boolean | null, ghRepoRef?: string | null, ppmsScv?: string | null, jiraRef?: string | null, creationTimestamp?: string | null } | null };

export type DeleteOscRegistrationMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type DeleteOscRegistrationMutation = { __typename?: 'Mutation', deleteOscRegistration?: string | null };
