import { GithubService } from './github.service'

describe('GithubService', () => {
  let githubService: GithubService

  beforeEach(() => {
    githubService = new GithubService(null)
  })

  it('should create', () => {
    expect(githubService).toBeTruthy()
  })
})
