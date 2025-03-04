import { gql } from 'apollo-angular'

/**
 *
 * Queries to external services
 */

export const GET_REPO_LANGUAGES = gql`
  query GetRepoLanguages($tenantId: String!, $projectId: String!, $componentId: String!) {
    component(tenantId: $tenantId, projectId: $projectId, componentId: $componentId) {
      extensions {
        repository {
          url
        }
        languages {
          Languages {
            Name
            Bytes
          }
        }
      }
    }
  }
`

export const GET_REPO_PULLS = gql`
  subscription GetRepoPulls($tenantId: String!, $projectId: String!, $componentId: String!) {
    watchComponent(tenantId: $tenantId, projectId: $projectId, componentId: $componentId) {
      extensions {
        repository {
          url
          openPullRequests {
            title
          }
        }
      }
    }
  }
`
