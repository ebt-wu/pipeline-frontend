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
  id?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
};

export enum DeletionPolicy {
  Delete = 'DELETE',
  Orphan = 'ORPHAN'
}

export type GithubCreationRequest = {
  baseUrl?: InputMaybe<Scalars['String']['input']>;
  org: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  secretPath: Scalars['String']['input'];
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
};

export type JenkinsPipeline = {
  __typename?: 'JenkinsPipeline';
  creationTimestamp?: Maybe<Scalars['String']['output']>;
  jobUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  secretPath?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createCumulusPipeline?: Maybe<Scalars['String']['output']>;
  createGithubRepository?: Maybe<Scalars['String']['output']>;
  createJenkinsPipeline?: Maybe<Scalars['String']['output']>;
  createPipeline: Scalars['String']['output'];
  createPiperConfig?: Maybe<Scalars['String']['output']>;
  deleteCumulusPipeline?: Maybe<Scalars['String']['output']>;
  deleteGithubRepository?: Maybe<Scalars['String']['output']>;
  deleteJenkinsPipeline?: Maybe<Scalars['String']['output']>;
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


export type MutationCreatePipelineArgs = {
  componentId: Scalars['String']['input'];
  pipelineType?: InputMaybe<PipelineType>;
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

export type Pipeline = {
  __typename?: 'Pipeline';
  name: Scalars['String']['output'];
  pipelineType: PipelineType;
  resourceRefs?: Maybe<Array<ResourceRef>>;
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
  getGithubRepository?: Maybe<GithubRepository>;
  getJenkinsPipeline?: Maybe<JenkinsPipeline>;
  getPipelineSecrets?: Maybe<Array<Scalars['String']['output']>>;
  getPiperConfig: PiperConfig;
  getStagingServiceCredential?: Maybe<StagingServiceCredential>;
  onboardingGroups: Array<Maybe<Group>>;
};


export type QueryGetCumulusPipelineArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetGithubRepositoryArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
};


export type QueryGetJenkinsPipelineArgs = {
  projectId: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
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
  error: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type SecretData = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
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
  pipelineType: PipelineType;
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


export type WatchPipelineSubscription = { __typename?: 'Subscription', watchPipeline: { __typename?: 'Pipeline', name: string, pipelineType: PipelineType, resourceRefs?: Array<{ __typename?: 'ResourceRef', kind: string, status: string, error: string, name: string }> | null } };

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


export type GetPipelineSecretsQuery = { __typename?: 'Query', getPipelineSecrets?: Array<string> | null };

export type CreateGithubRepositoryMutationVariables = Exact<{
  projectId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  baseUrl: Scalars['String']['input'];
  org: Scalars['String']['input'];
  repo: Scalars['String']['input'];
  secretPath: Scalars['String']['input'];
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


export type GetCumulusPipelineQuery = { __typename?: 'Query', getCumulusPipeline?: { __typename?: 'CumulusPipeline', id?: string | null, key?: string | null, creationTimestamp?: string | null } | null };

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
