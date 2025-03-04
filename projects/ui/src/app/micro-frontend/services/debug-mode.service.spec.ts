import { DxpLuigiContextService } from '@dxp/ngx-core/luigi'
import { MessageToastService } from '@fundamental-ngx/core'
import { MockService } from 'ng-mocks'
import { of } from 'rxjs'
import { BaseAPIService } from './base.service'
import { DebugModeService } from './debug-mode.service'

describe('DebugModeService', () => {
  let debugModeService: DebugModeService

  beforeEach(() => {
    const luigiService = MockService(DxpLuigiContextService, {
      contextObservable: () => of(),
    })
    const messageToastService = MockService(MessageToastService)
    const apiService = MockService(BaseAPIService)

    debugModeService = new DebugModeService(messageToastService, apiService, luigiService)
  })

  it('should create', () => {
    expect(debugModeService).toBeTruthy()
  })

  it('should toggle debug mode', () => {
    debugModeService.toggleDebugMode()
    expect(debugModeService.debugModeEnabled()).toBe(true)
    debugModeService.toggleDebugMode()
    expect(debugModeService.debugModeEnabled()).toBe(false)
  })
})
