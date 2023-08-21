import { DebugModeService } from './debug-mode.service'

describe('DebugModeService', () => {
  let debugModeService: DebugModeService

  beforeEach(() => {
    debugModeService = new DebugModeService(null)
  })

  it('should create', () => {
    expect(debugModeService).toBeTruthy()
  })
})
