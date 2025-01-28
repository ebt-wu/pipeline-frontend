import { gql } from 'apollo-angular'
import {
  CreatePiperConfigMutation,
  CreatePiperConfigMutationVariables,
  DeleteJenkinsPipelineMutation,
  DeleteJenkinsPipelineMutationVariables,
  MutationToggleDebugLabelArgs,
  ToggleDebugLabelMutation,
} from '@generated/graphql'

/**
 * PIPELINE QUERIES
 */

export const CREATE_PIPELINE = gql`
  mutation CreatePipeline($projectId: String!, $componentId: String!, $params: PipelineCreationRequest!) {
    createPipeline(projectId: $projectId, componentId: $componentId, params: $params)
  }
`

export const DELETE_PIPELINE = gql`
  mutation DeletePipeline($projectId: String!, $componentId: String!) {
    deletePipeline(projectId: $projectId, componentId: $componentId)
  }
`

export const DELETE_NOT_MANAGED_SERVICE = gql`
  mutation DeleteNotManagedService($stepKey: String!, $projectId: String!, $componentId: String!) {
    deleteNotManagedService(stepKey: $stepKey, projectId: $projectId, componentId: $componentId)
  }
`

export const WATCH_PIPELINE = gql`
  subscription WatchPipeline($projectId: String!, $componentId: String!) {
    watchPipeline(projectId: $projectId, componentId: $componentId) {
      name
      pipelineType
      namespace
      automaticdClientName
      automaticdClientNamespace
      labels {
        key
        value
      }
      resourceRefs {
        kind
        status
        error
        name
      }
    }
  }
`

export const WATCH_NOT_MANAGED_SERVICES = gql`
  subscription WatchNotManagedServices($projectId: String!, $componentId: String!) {
    watchNotManagedServices(projectId: $projectId, componentId: $componentId) {
      pipelineCreationTimestamp
      azureDevOps {
        azurePipelineName
        azureProjectName
        azurePipelineId
        pipelineDefinitionUrl
        secretPath
      }
      cnb {
        builder
        path
      }
      xmake {
        id
        uuid
        projectPortalProjectUrl
        secretPath
      }
      commonRepository {
        secretPath
      }
      blackDuckHub {
        pipelineName
        ppmsId
        groupName
        projectLink
        secretPath
      }
      checkmarx {
        teamName
        projectName
        teamFullName
        secretPath
      }
      checkmarxOne {
        applicationName
        applicationUrl
        projectName
        secretPath
      }
      fortify {
        projectName
        secretPath
      }
      whiteSource {
        productName
        productUrl
        serviceUserName
        serviceUserEmail
      }
      ppmsFoss {
        scvId
        scvName
        ppmsLightSCVURL
      }
      kubernetes {
        chartPath
        acceptance {
          enabled
          secret
          deployTool
          helm {
            namespace
            deploymentName
            valuesFilePath
          }
          kubectl {
            manifestFilePath
            namespace
          }
        }
        performance {
          enabled
          secret
          deployTool
          helm {
            namespace
            deploymentName
            valuesFilePath
          }
          kubectl {
            manifestFilePath
            namespace
          }
        }
        release {
          enabled
          secret
          deployTool
          helm {
            namespace
            deploymentName
            valuesFilePath
          }
          kubectl {
            manifestFilePath
            namespace
          }
        }
      }
      cloudFoundry {
        acceptance {
          enabled
          secret
          organization
          space
          manifest
          testServerUrl
        }
        performance {
          enabled
          secret
          organization
          space
          manifest
          testServerUrl
        }
        release {
          enabled
          secret
          organization
          space
          manifest
          testServerUrl
        }
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
    getPipelineSecrets(projectId: $projectId, componentId: $componentId) {
      path
      metadata {
        scopes
      }
    }
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
    $isGithubActionsGPP: Boolean!
  ) {
    createGithubRepository(
      projectId: $projectId
      componentId: $componentId
      params: { baseUrl: $baseUrl, org: $org, repo: $repo, isGithubActionsGPP: $isGithubActionsGPP }
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
      groupId
      groupKey
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
    $githubRepositorySecretPath: String!
    $labels: [LabelInput!]
  ) {
    createJenkinsPipeline(
      projectId: $projectId
      componentId: $componentId
      params: {
        jenkinsUrl: $jenkinsUrl
        jenkinsSecretPath: $jenkinsSecretPath
        githubRepositoryResource: $githubRepositoryResource
        githubRepositorySecretPath: $githubRepositorySecretPath
        labels: $labels
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

export const DELETE_JENKINS_PIPELINE = gql<DeleteJenkinsPipelineMutation, DeleteJenkinsPipelineMutationVariables>`
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

export const CREATE_PIPER_CONFIG = gql<CreatePiperConfigMutation, CreatePiperConfigMutationVariables>`
  mutation CreatePiperConfig(
    $projectId: String!
    $componentId: String!
    $githubSecretRef: String
    $repositoryResource: String!
    $buildTool: BuildTool!
    $pipelineOptimization: Boolean!
    $dockerImageName: String
    $labels: [LabelInput!]
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
        labels: $labels
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
export const TOGGLE_DEBUG_LABEL = gql<ToggleDebugLabelMutation, MutationToggleDebugLabelArgs>`
  mutation ToggleDebugLabel($projectId: String!, $kind: String!, $resourceName: String!, $userId: String!) {
    toggleDebugLabel(projectId: $projectId, kind: $kind, resourceName: $resourceName, userId: $userId)
  }
`

/**
 * GITHUB ACTIONS QUERIES
 */

export const CREATE_GITHUB_ACTIONS = gql`
  mutation CreateGithubActions(
    $projectId: String!
    $componentId: String!
    $githubInstance: String!
    $githubOrganization: String!
  ) {
    createGithubActions(
      projectId: $projectId
      componentId: $componentId
      params: { githubInstance: $githubInstance, githubOrganization: $githubOrganization }
    )
  }
`

export const DELETE_GITHUB_ACTIONS = gql`
  mutation DeleteGithubActions($projectId: String!, $componentId: String!, $resourceName: String!) {
    deleteGithubActions(projectId: $projectId, componentId: $componentId, resourceName: $resourceName)
  }
`

export const GET_GITHUB_ACTONS_SOLINAS_VERIFICATION = gql`
  query getGithubActionsSolinasVerification($projectId: String!, $githubOrg: String!, $githubUrl: String!) {
    getGithubActionsSolinasVerification(projectId: $projectId, githubOrg: $githubOrg, githubUrl: $githubUrl)
  }
`

/**
 * GITHUB ADVANCED SECURITY QUERIES
 */

export const GET_GITHUB_ACTIONS_CROSS_NAMESPACE = gql`
  query GetGithubActionsCrossNamespace($projectId: String!, $githubOrg: String!, $githubInstance: String!) {
    getGithubActionsCrossNamespace(projectId: $projectId, githubOrg: $githubOrg, githubInstance: $githubInstance) {
      solinasCustomerID
      githubOrganization
      githubInstance
      secretPath
      creationTimestamp
      isAlreadyManaged
      responsibleProject
    }
  }
`

export const CREATE_GITHUB_ADVANCED_SECURITY = gql`
  mutation CreateGitHubAdvancedSecurity(
    $projectId: String!
    $componentId: String!
    $codeScanJobOrchestrator: Orchestrators
    $buildTool: BuildTool
    $labels: [LabelInput!]
  ) {
    createGitHubAdvancedSecurity(
      projectId: $projectId
      componentId: $componentId
      params: { codeScanJobOrchestrator: $codeScanJobOrchestrator, buildTool: $buildTool, labels: $labels }
    )
  }
`

export const GET_GITHUB_ADVANCED_SECURITY = gql`
  query getGitHubAdvancedSecurity($projectId: String!, $resourceName: String!) {
    getGitHubAdvancedSecurity(projectId: $projectId, resourceName: $resourceName) {
      githubInstance
      githubOrganization
      creationTimestamp
    }
  }
`

export const DELETE_GITHUB_ADVANCED_SECURITY = gql`
  mutation deleteGitHubAdvancedSecurity($projectId: String!, $resourceName: String!) {
    deleteGitHubAdvancedSecurity(projectId: $projectId, resourceName: $resourceName)
  }
`

/**
 * OPEN SOURCE COMPLIANCE QUERIES
 */

export const CREATE_OPEN_SOURCE_COMPLIANCE = gql`
  mutation CreateOscRegistration(
    $projectId: String!
    $componentId: String!
    $jira: String
    $ppmsScv: String
    $githubBaseUrl: String!
    $githubOrg: String!
    $githubRepo: String!
    $isGithubActionsGPP: Boolean!
  ) {
    createOscRegistration(
      projectId: $projectId
      componentId: $componentId
      params: {
        jira: $jira
        ppmsScv: $ppmsScv
        githubInfo: {
          baseUrl: $githubBaseUrl
          org: $githubOrg
          repo: $githubRepo
          isGithubActionsGPP: $isGithubActionsGPP
        }
      }
    )
  }
`

export const GET_OPEN_SOURCE_COMPLIANCE = gql`
  query GetOscRegistration($projectId: String!, $componentId: String!) {
    getOscRegistration(projectId: $projectId, componentId: $componentId) {
      oscResourceName
      cumulusPipelineId
      isActive
      ghRepoRef
      ppmsScv
      jiraRef
      creationTimestamp
    }
  }
`

export const DELETE_OPEN_SOURCE_COMPLIANCE = gql`
  mutation DeleteOscRegistration($projectId: String!, $componentId: String!) {
    deleteOscRegistration(projectId: $projectId, componentId: $componentId)
  }
`

export const GET_JIRA_PROJECTS = gql`
  query GetJiraProjects($projectId: String!) {
    getJiraProjects(projectId: $projectId) {
      projectKey
      jiraInstanceUrl
      resourceName
    }
  }
`

export const GET_SONARQUBE_PROJECT = gql`
  query GetSonarQubeProject($projectId: String!, $resourceName: String!) {
    getSonarQubeProject(projectId: $projectId, resourceName: $resourceName) {
      host
      name
      repositoryRef
      secretPath
      configString
    }
  }
`
