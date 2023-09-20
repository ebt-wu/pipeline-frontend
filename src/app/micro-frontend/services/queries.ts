import { gql } from 'apollo-angular'

/**
 * PIPELINE QUERIES
 */

export const CREATE_PIPELINE = gql`
  mutation CreatePipeline($projectId: String!, $componentId: String!, $pipelineType: PipelineType!) {
    createPipeline(projectId: $projectId, componentId: $componentId, pipelineType: $pipelineType)
  }
`

export const DELETE_PIPELINE = gql`
  mutation DeletePipeline($projectId: String!, $componentId: String!) {
    deletePipeline(projectId: $projectId, componentId: $componentId)
  }
`

export const WATCH_PIPELINE = gql`
  subscription WatchPipeline($projectId: String!, $componentId: String!) {
    watchPipeline(projectId: $projectId, componentId: $componentId) {
      name
      pipelineType
      resourceRefs {
        kind
        status
        error
        name
      }
    }
  }
`

/**
 * SECRETS QUERIES
 */

export const WRITE_SECRET = gql`
  mutation WriteSecret($projectId: String!, $vaultPath: String!, $data: [SecretData!]!) {
    writeSecret(projectId: $projectId, vaultPath: $vaultPath, data: $data)
  }
`

export const GET_PIPELINE_SECRETS = gql`
  query GetPipelineSecrets($projectId: String!, $componentId: String!) {
    getPipelineSecrets(projectId: $projectId, componentId: $componentId)
  }
`

/**
 * GITHUB REPOSITORY QUERIES
 */

export const CREATE_GITHUB_REPOSITORY = gql`
  mutation CreateGithubRepository(
    $projectId: String!
    $componentId: String!
    $baseUrl: String!
    $org: String!
    $repo: String!
    $secretPath: String!
  ) {
    createGithubRepository(
      projectId: $projectId
      componentId: $componentId
      params: { baseUrl: $baseUrl, org: $org, repo: $repo, secretPath: $secretPath }
    )
  }
`

export const DELETE_GITHUB_REPOSITORY = gql`
  mutation DeleteGithubRepository($projectId: String!, $componentId: String!, $resourceName: String!) {
    deleteGithubRepository(projectId: $projectId, componentId: $componentId, resourceName: $resourceName)
  }
`

export const GET_GITHUB_REPOSITORY = gql`
  query GetGithubRepository($projectId: String!, $resourceName: String!) {
    getGithubRepository(projectId: $projectId, resourceName: $resourceName) {
      repository
      organization
      repositoryUrl
      secretPath
      creationTimestamp
    }
  }
`

/**
 * CUMULUS QUERIES
 */

export const DELETE_CUMULUS_PIPELINE = gql`
  mutation DeleteCumulusPipeline($projectId: String!, $resourceName: String!, $componentId: String!) {
    deleteCumulusPipeline(projectId: $projectId, resourceName: $resourceName, componentId: $componentId)
  }
`

export const GET_CUMULUS_PIPELINE = gql`
  query GetCumulusPipeline($projectId: String!, $resourceName: String!) {
    getCumulusPipeline(projectId: $projectId, resourceName: $resourceName) {
      id
      key
      creationTimestamp
    }
  }
`

/**
 * STAGING SERVICE QUERIES
 */

export const REMOVE_STAGING_SERVICE_CREDENTIAL = gql`
  mutation RemoveStagingServiceCredential($projectId: String!, $componentId: String!) {
    removeStagingServiceCredential(projectId: $projectId, componentId: $componentId)
  }
`

export const GET_STAGING_SERVICE_CREDENTIAL = gql`
  query GetStagingServiceCredential($projectId: String!) {
    getStagingServiceCredential(projectId: $projectId) {
      profileName
      url
      secretPath
      creationTimestamp
    }
  }
`

/**
 * JENKINS PIPELINE QUERIES
 */

export const CREATE_JENKINS_PIPELINE = gql`
  mutation CreateJenkinsPipeline(
    $projectId: String!
    $componentId: String!
    $jenkinsUrl: String!
    $jenkinsSecretPath: String!
    $githubRepositoryResource: String!
  ) {
    createJenkinsPipeline(
      projectId: $projectId
      componentId: $componentId
      params: {
        jenkinsUrl: $jenkinsUrl
        jenkinsSecretPath: $jenkinsSecretPath
        githubRepositoryResource: $githubRepositoryResource
      }
    )
  }
`

export const GET_JENKINS_PIPELINE = gql`
  query GetJenkinsPipeline($projectId: String!, $resourceName: String!) {
    getJenkinsPipeline(projectId: $projectId, resourceName: $resourceName) {
      name
      jobUrl
      secretPath
      creationTimestamp
    }
  }
`

export const DELETE_JENKINS_PIPELINE = gql`
  mutation DeleteJenkinsPipeline(
    $projectId: String!
    $componentId: String!
    $resourceName: String!
    $deletionPolicy: DeletionPolicy
  ) {
    deleteJenkinsPipeline(
      projectId: $projectId
      componentId: $componentId
      resourceName: $resourceName
      deletionPolicy: $deletionPolicy
    )
  }
`

/**
 * PIPER CONFIG QUERIES
 */

export const CREATE_PIPER_CONFIG = gql`
  mutation CreatePiperConfig(
    $projectId: String!
    $componentId: String!
    $githubSecretRef: String!
    $repositoryResource: String!
    $buildTool: BuildTool!
    $pipelineOptimization: Boolean!
    $dockerImageName: String
  ) {
    createPiperConfig(
      projectId: $projectId
      componentId: $componentId
      params: {
        repositoryResource: $repositoryResource
        githubSecretRef: $githubSecretRef
        templateArgs: {
          general: { buildTool: $buildTool, pipelineOptimization: $pipelineOptimization }
          stagingService: { dockerImageName: $dockerImageName }
        }
      }
    )
  }
`

export const GET_PIPER_CONFIG = gql`
  query GetPiperConfig($projectId: String!, $resourceName: String!) {
    getPiperConfig(projectId: $projectId, resourceName: $resourceName) {
      pullRequestURL
      configString
      creationTimestamp
    }
  }
`

export const DELETE_PIPER_CONFIG = gql`
  mutation DeletePiperConfig($projectId: String!, $componentId: String!, $resourceName: String!) {
    deletePiperConfig(projectId: $projectId, componentId: $componentId, resourceName: $resourceName)
  }
`

/**
 * VAULT QUERIES
 */

export const ENSURE_VAULT_ONBOARDING = gql`
  mutation EnsureVaultOnboarding($tenantId: String!, $projectId: String!) {
    ensureVaultOnboarding(tenantId: $tenantId, projectId: $projectId) {
      token
      vaultUrl
    }
  }
`

/**
 * FORCE RECONCILIATION
 */

export const FORCE_DEBUG_RECONCILIATION = gql`
  mutation ForceDebugReconciliation($projectId: String!, $kind: String!, $resourceName: String!) {
    forceDebugReconciliation(projectId: $projectId, kind: $kind, resourceName: $resourceName) 
  }
`
