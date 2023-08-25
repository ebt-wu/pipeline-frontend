import { DebugModeService } from './debug-mode.service'

describe('DebugModeService', () => {
  let debugModeService: DebugModeService

  beforeEach(() => {
    debugModeService = new DebugModeService(null, null, null)
  })

  it('should create', () => {
    expect(debugModeService).toBeTruthy()
  })
})
