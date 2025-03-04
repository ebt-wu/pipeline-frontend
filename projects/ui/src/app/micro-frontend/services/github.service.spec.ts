import { ProgrammingLanguages } from '@constants'
import { MetadataApolloClientService } from '@dxp/ngx-core/apollo'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { MockService } from 'ng-mocks'
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
})
