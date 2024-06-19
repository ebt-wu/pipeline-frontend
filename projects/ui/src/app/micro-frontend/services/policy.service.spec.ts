import { PolicyService } from './policy.service'
import { MockService } from 'ng-mocks'
import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'

describe('PolicyService', () => {
  let policyService: PolicyService
  let mockLuigiService: DxpLuigiContextService
  beforeEach(() => {
    jest.resetAllMocks()
    mockLuigiService = MockService(DxpLuigiContextService)
    policyService = new PolicyService(mockLuigiService)
  })

  it('should create', () => {
    expect(policyService).toBeTruthy()
  })

  describe('edit credentials', () => {
    it('vault maintainer should be able to edit credentials', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['vault_maintainer'])
      expect(await policyService.canUserEditCredentials()).toEqual(true)
    })

    it('project member should NOT be able to edit credentials', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['member'])
      expect(await policyService.canUserEditCredentials()).toEqual(false)
    })

    it('project member who is also owner should be able to edit credentials', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['member', 'owner'])
      expect(await policyService.canUserEditCredentials()).toEqual(true)
    })
    it('owner should be able to edit credentials', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['owner'])
      expect(await policyService.canUserEditCredentials()).toEqual(true)
    })
    it('user with no policies should not be able to edit credentials', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue([])
      expect(await policyService.canUserEditCredentials()).toEqual(false)
    })
  })

  describe('canUserSetUpPipeline', () => {
    it('vault maintainer should be able to set up pipeline', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['vault_maintainer'])
      expect(await policyService.canUserSetUpPipeline()).toEqual(true)
    })
    it('project member should be able to set up pipeline', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['member'])
      expect(await policyService.canUserSetUpPipeline()).toEqual(true)
    })

    it('project owner should be able to set up pipeline', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue(['owner'])
      expect(await policyService.canUserSetUpPipeline()).toEqual(true)
    })
    it('user with no policies should NOT be able to set up pipeline', async () => {
      policyService.getUserPolicies = jest.fn().mockResolvedValue([])
      expect(await policyService.canUserSetUpPipeline()).toEqual(false)
    })
  })
})
