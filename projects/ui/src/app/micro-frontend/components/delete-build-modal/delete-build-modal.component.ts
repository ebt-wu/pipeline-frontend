import { CommonModule } from '@angular/common'
import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Kinds } from '@enums'
import { FormModule, FundamentalNgxCoreModule, MessageBoxRef } from '@fundamental-ngx/core'

@Component({
  standalone: true,
  selector: 'delete-build-modal',
  templateUrl: 'delete-build-modal.component.html',
  styleUrls: ['delete-build-modal.component.css'],
  imports: [CommonModule, FundamentalNgxCoreModule, FormModule, FormsModule],
})
export class DeleteBuildModal {
  typedComponentId = ''
  advancedSettingsOpen = signal(false)
  softDeleteServices = false
  Kinds = Kinds

  constructor(
    public messageBoxRef: MessageBoxRef<{
      componentId: string
      orchestratorKind: Kinds
    }>,
  ) {}

  deleteBtnDisabled(): boolean {
    return this.typedComponentId !== this.messageBoxRef.data.componentId
  }

  toggleAdvancedSettings() {
    this.advancedSettingsOpen.set(!this.advancedSettingsOpen())
  }

  close(action: 'delete' | 'cancel') {
    if (action === 'cancel') {
      this.messageBoxRef.close(action)
    }

    if (this.deleteBtnDisabled()) {
      return
    }

    if (action === 'delete') {
      if (this.softDeleteServices) {
        this.messageBoxRef.close('soft-delete')
      } else {
        this.messageBoxRef.close('hard-delete')
      }
      return
    }
  }
}
