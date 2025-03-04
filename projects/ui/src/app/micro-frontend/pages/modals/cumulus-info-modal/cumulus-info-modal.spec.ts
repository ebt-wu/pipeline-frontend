import { LuigiClient } from '@dxp/ngx-core/luigi'
import { MockService } from 'ng-mocks'
import { CumulusService } from '../../../services/cumulus.service'
import { PipelineService } from '../../../services/pipeline.service'
import { PolicyService } from '../../../services/policy.service'
import { SecretService } from '../../../services/secret.service'
import { CumulusInfoModalComponent } from './cumulus-info-modal.component'

describe('Cumulus Info Modal HSOBRD-74', () => {
  let cumulusInfoModal: CumulusInfoModalComponent
  let mockLuigiClient: LuigiClient
  let mockPipelineService: PipelineService
  let mockCumulusService: CumulusService
  let mockSecretService: SecretService
  let mockPolicyService: PolicyService
  let mockWriteText

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()

    mockLuigiClient = MockService(LuigiClient)
    mockPipelineService = MockService(PipelineService)
    mockCumulusService = MockService(CumulusService)
    mockSecretService = MockService(SecretService)
    mockPolicyService = MockService(PolicyService)

    cumulusInfoModal = new CumulusInfoModalComponent(
      mockPipelineService,
      mockCumulusService,
      mockSecretService,
      mockLuigiClient,
      mockPolicyService,
    )

    cumulusInfoModal.cumulusInfo = {
      groupId: 'group-id',
      groupKey: 'group-key-123',
      id: 'pipeline-id-123',
      key: 'pipeline-key-123',
    }

    // mock clipboard - see here: https://stackoverflow.com/questions/62351935/how-to-mock-navigator-clipboard-writetext-in-jest
    mockWriteText = jest.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
    })
  })

  describe('Copy to clipboard', () => {
    it('should copy text to clipboard', async () => {
      await cumulusInfoModal.copyToClipboard('group-key-123')
      expect(mockWriteText).toHaveBeenCalledWith('group-key-123')
    })
  })
})
