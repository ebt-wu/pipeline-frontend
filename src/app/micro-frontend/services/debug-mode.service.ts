import { Injectable, signal } from '@angular/core'
import { MessageToastService } from '@fundamental-ngx/core'

@Injectable({ providedIn: 'root' })
export class DebugModeService {
  constructor(public messageToastService: MessageToastService) {}

  debugModeEnabled = signal(false)

  toggleDebugMode() {
    this.debugModeEnabled.set(!this.debugModeEnabled())

    let content = 'Debug mode enabled'
    if (!this.debugModeEnabled()) {
      content = 'Debug mode disabled'
    }

    this.messageToastService.open(content, {
      duration: 5000,
    })
  }
}
