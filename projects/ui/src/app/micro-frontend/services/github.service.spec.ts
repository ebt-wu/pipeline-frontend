import { ProgrammingLanguages } from '@constants'
import { MetadataApolloClientService } from '@dxp/ngx-core/apollo'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { MockService } from 'ng-mocks'
import { of } from 'rxjs'
import { BaseAPIService } from './base.service'
import { GithubService } from './github.service'
import { SecretService } from './secret.service'

describe('GitHubService', () => {
  let githubService: GithubService
  let mockApiService: BaseAPIService
  let mockLuigiService: DxpLuigiContextService
  let mockSecretService: SecretService
  let mockMetadataService: MetadataApolloClientService
  beforeEach(() => {
    jest.resetAllMocks()
    mockApiService = MockService(BaseAPIService)
    mockLuigiService = MockService(DxpLuigiContextService)
    mockSecretService = MockService(SecretService)
    mockMetadataService = MockService(MetadataApolloClientService)

    githubService = new GithubService(mockApiService, mockLuigiService, mockSecretService, mockMetadataService)
  })

  it('should create', () => {
    expect(githubService).toBeTruthy()
  })

  describe('getMostUsedLanguage', () => {
    it('should return other for a language that is not in ValidationLanguages', () => {
      expect(githubService.getMostUsedLanguage([{ Name: 'FORTRAN', Bytes: 200 }], ProgrammingLanguages)).toMatchObject({
        displayName: 'Other',
        id: 'Other',
      })
    })
    it('should return the most used language', () => {
      expect(
        githubService.getMostUsedLanguage(
          [
            { Name: 'Python', Bytes: 1000 },
            { Name: 'Java', Bytes: 20 },
            { Name: 'Golang', Bytes: 300 },
          ],
          ProgrammingLanguages,
        ),
      ).toMatchObject({
        displayName: 'Python',
        id: 'Python',
      })
    })
    it('should return other if the most used language isnt in validationLanguages', () => {
      expect(
        githubService.getMostUsedLanguage(
          [
            { Name: 'Python', Bytes: 1000 },
            { Name: 'Fortran', Bytes: 2000 },
            { Name: 'Golang', Bytes: 300 },
          ],
          ProgrammingLanguages,
        ),
      ).toMatchObject({
        displayName: 'Other',
        id: 'Other',
      })
    })
    it('should return other if the languages array is empty', () => {
      expect(githubService.getMostUsedLanguage([], ProgrammingLanguages)).toMatchObject({
        displayName: 'Other',
        id: 'Other',
      })
    })
  })

  describe('getGithubMetadata', () => {
    it('should get the correct github metadata when URL is provided from getComponentExtensions', async () => {
      const mockQueryComponentMeta = {
        data: {
          component: {
            extensions: {
              repository: {
                url: 'https://github.tools.sap/some-org/some-repo',
                openPullRequests: [],
              },
            },
          },
        },
      }

      mockMetadataService.apollo = jest.fn().mockReturnValue(
        of({
          query: jest.fn().mockReturnValue(of(mockQueryComponentMeta)),
        }),
      )
      mockLuigiService.contextObservable = jest
        .fn()
        .mockReturnValue(
          of({ context: { tenantid: 'some-tenant', projectId: 'some-project', componentId: 'some-component' } }),
        )
      githubService = new GithubService(mockApiService, mockLuigiService, mockSecretService, mockMetadataService)

      const result = await githubService.getGithubMetadata()
      expect(result.githubRepoName).toBe('some-repo')
      expect(result.githubRepoUrl).toBe('https://github.tools.sap/some-org/some-repo')
      expect(result.githubOrgName).toBe('some-org')
      expect(result.githubHostName).toBe('github.tools.sap')
      expect(result.githubInstance).toBe('https://github.tools.sap')
      expect(result.githubTechnicalUserSelfServiceUrl).toBe('https://technical-user-management.github.tools.sap/')
    })

    it('should get the correct github metadata for WDF github when URL is provided by getComponentExtensions', async () => {
      const mockQueryComponentMeta = {
        data: {
          component: {
            extensions: {
              repository: {
                url: 'https://github.wdf.sap.corp/some-org/some-repo',
                openPullRequests: [],
              },
            },
          },
        },
      }

      mockMetadataService.apollo = jest.fn().mockReturnValue(
        of({
          query: jest.fn().mockReturnValue(of(mockQueryComponentMeta)),
        }),
      )
      mockLuigiService.contextObservable = jest
        .fn()
        .mockReturnValue(
          of({ context: { tenantid: 'some-tenant', projectId: 'some-project', componentId: 'some-component' } }),
        )
      githubService = new GithubService(mockApiService, mockLuigiService, mockSecretService, mockMetadataService)

      const result = await githubService.getGithubMetadata()
      expect(result.githubRepoName).toBe('some-repo')
      expect(result.githubRepoUrl).toBe('https://github.wdf.sap.corp/some-org/some-repo')
      expect(result.githubOrgName).toBe('some-org')
      expect(result.githubHostName).toBe('github.wdf.sap.corp')
      expect(result.githubInstance).toBe('https://github.wdf.sap.corp')
      expect(result.githubTechnicalUserSelfServiceUrl).toBe('https://technical-user-management.github.tools.sap.corp/')
    })

    it('should not throw an error when no github repository url is found in component extensions', async () => {
      const mockQueryComponentMeta = {
        data: {
          component: {
            extensions: {
              repository: {
                url: undefined,
                openPullRequests: [],
              },
            },
          },
        },
      }

      mockMetadataService.apollo = jest.fn().mockReturnValue(
        of({
          query: jest.fn().mockReturnValue(of(mockQueryComponentMeta)),
        }),
      )
      mockLuigiService.contextObservable = jest
        .fn()
        .mockReturnValue(
          of({ context: { tenantid: 'some-tenant', projectId: 'some-project', componentId: 'some-component' } }),
        )
      githubService = new GithubService(mockApiService, mockLuigiService, mockSecretService, mockMetadataService)

      const result = await githubService.getGithubMetadata()
      expect(result.githubRepoName).toBe('')
      expect(result.githubRepoUrl).toBe('')
      expect(result.githubOrgName).toBe('')
      expect(result.githubHostName).toBe('')
      expect(result.githubInstance).toBe('')
      expect(result.githubTechnicalUserSelfServiceUrl).toBe('')
    })
  })
})
