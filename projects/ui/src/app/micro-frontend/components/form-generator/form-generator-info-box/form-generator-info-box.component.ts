import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { ButtonComponent } from '@fundamental-ngx/core/button'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-info-box',
  templateUrl: './form-generator-info-box.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrl: './form-generator-info-box.component.css',
})
export class PlatformFormGeneratorCustomInfoBoxComponent extends BaseDynamicFormGeneratorControl implements OnInit {
  instructions: Promise<string>
  showRefreshButton = false
  callBeforeRefresh: () => Promise<unknown>

  constructor() {
    super()
  }

  async refresh() {
    await this.callBeforeRefresh()
    location.reload()
  }

  ngOnInit(): void {
    const guiOptions = this.formItem.guiOptions
    const additionalData = guiOptions?.additionalData as {
      instructions: () => Promise<string>
      showRefreshButton: boolean
      callBeforeRefresh: () => Promise<unknown>
    }

    if (additionalData?.instructions) {
      this.instructions = additionalData.instructions()
    }

    if (additionalData?.showRefreshButton) {
      this.showRefreshButton = additionalData.showRefreshButton
    }

    if (additionalData?.callBeforeRefresh) {
      this.callBeforeRefresh = additionalData.callBeforeRefresh
    }
  }
}
