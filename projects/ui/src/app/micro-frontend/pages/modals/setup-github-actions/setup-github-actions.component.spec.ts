import { GithubActionsService } from '../../../services/github-actions.service'
import { GithubActionsComponent } from './setup-github-actions.component'
import { LuigiClient } from '@dxp/ngx-core/luigi'
import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks'
import { FormGeneratorService } from '@fundamental-ngx/platform/form'
import { GithubActionsFormService } from '../../../services/forms/github-actions-form.service'
import { GithubService } from '../../../services/github.service'
import { of } from 'rxjs'

describe('Set Up Github Actions Component', () => {
  const luigiCloseCurrentModalMock = jest.fn()

  beforeEach(async () => {
    return MockBuilder(GithubActionsComponent)
      .keep(FormGeneratorService)
      .mock(GithubService, {
        getGithubMetadata: jest.fn().mockResolvedValue({
          githubInstance: 'https://github.com',
          githubOrgName: 'org',
        }),
      })
      .mock(GithubActionsFormService, {
        buildFormItems: jest.fn().mockResolvedValue([]),
      })
      .mock(LuigiClient, {
        uxManager: jest.fn().mockReturnValue({
          closeCurrentModal: luigiCloseCurrentModalMock,
        }),
      })
  })
  afterEach(() => {
    jest.clearAllMocks()
    ngMocks.reset()
  })
  describe('onFormSubmitted', () => {
    it('onFormSubmitted should call createGHACStandalone', async () => {
      const createGhaMock = jest.fn().mockReturnValue(of('ghac-something-123'))
      MockInstance(GithubActionsService, 'createStandaloneGithubActionsClaim', createGhaMock)
      MockInstance(GithubActionsService, 'getGithubActionSolinasVerification', jest.fn().mockReturnValue(of(true)))

      const fixture = MockRender(GithubActionsComponent)
      const component = fixture.point.componentInstance
      fixture.detectChanges()

      await component.onFormSubmitted()

      expect(createGhaMock).toHaveBeenCalled()
      expect(luigiCloseCurrentModalMock).toHaveBeenCalled()
    })

    it('onFormSubmitted should call createGithubActionsEnablement and set the error if it fails', async () => {
      const creatGhaWithErrorMock = jest.fn().mockImplementation(() => {
        throw new Error('some error')
      })
      MockInstance(GithubActionsService, 'createStandaloneGithubActionsClaim', creatGhaWithErrorMock)
      MockInstance(GithubActionsService, 'getGithubActionSolinasVerification', jest.fn().mockReturnValue(of(true)))
      const fixture = MockRender(GithubActionsComponent)
      const component = fixture.point.componentInstance
      fixture.detectChanges()

      await component.onFormSubmitted()

      expect(creatGhaWithErrorMock).toHaveBeenCalled()
      expect(luigiCloseCurrentModalMock).not.toHaveBeenCalled()
      expect(component.errorMessage()).toEqual('some error')
    })
  })
})
