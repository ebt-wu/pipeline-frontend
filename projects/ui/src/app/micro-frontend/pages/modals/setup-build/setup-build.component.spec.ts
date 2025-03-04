import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { Orchestrators } from '@enums'
import { BuildTool } from '@generated/graphql'
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks'
import { of } from 'rxjs'
import { createPipelineForTests } from '../../../../../../test-utils'
import { FeatureFlagService } from '../../../services/feature-flag.service'
import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubService } from '../../../services/github.service'
import { PipelineService } from '../../../services/pipeline.service'
import { SetupBuildComponent } from './setup-build.component'

describe('setup-build-component', () => {
  const context = {
    frameContext: undefined,
    frameBaseUrl: 'test-url',
    tenantid: '1',
    projectId: 'project',
    token: '2',
    userid: '3',
    entityContext: undefined,
  }

  beforeEach(async () => {
    return MockBuilder(SetupBuildComponent)
      .mock(DxpLuigiContextService, {
        contextObservable: jest.fn().mockReturnValue(of({ context })),
        getContextAsync: jest.fn().mockResolvedValue(context),
      })
      .mock(GithubService, {
        getGithubMetadata: jest.fn().mockResolvedValue({
          githubRepoUrl: 'https://github.tools.sap/some-org/test-name',
          githubRepoName: 'test-name',
          githubInstance: 'test-instance',
          githubOrgName: 'some-org',
        }),
        createGithubRepository: jest.fn().mockReturnValue(of('some-gh-repo-resource')),
      })
      .mock(FeatureFlagService, {
        isGithubActionsEnabled: jest.fn().mockResolvedValue(true),
      })
      .mock(PipelineService, {
        watchPipeline: jest.fn().mockReturnValue(of(createPipelineForTests())),
      })
  })

  it('should create', () => {
    const fixture = MockRender(SetupBuildComponent)
    expect(fixture.point.componentInstance).toBeTruthy()
  })

  describe('onFormSubmitted', () => {
    it('should call createGithubActionsPipeline when github actions is selected', async () => {
      const createGHAPMock = jest.fn().mockReturnValue(of(''))
      MockInstance(GithubActionsService, 'createGithubActionsPipeline', createGHAPMock)

      const fixture = MockRender(SetupBuildComponent)
      fixture.detectChanges()
      const component = fixture.point.componentInstance

      const buildFormValue = {
        buildTool: BuildTool.Docker,
        orchestrator: Orchestrators.GITHUB_ACTIONS_PIPELINE,
      }
      await component.onFormSubmitted(buildFormValue)
      expect(createGHAPMock).toHaveBeenCalled()
    })
  })
})
