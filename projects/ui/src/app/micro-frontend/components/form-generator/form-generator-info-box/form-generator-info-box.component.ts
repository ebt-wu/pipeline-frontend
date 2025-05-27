import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ButtonComponent } from '@fundamental-ngx/core/button'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

export interface FormGeneratorInfoBoxAdditionalData {
  header?: string
  instructions?: () => Promise<string>
  showRefreshButton?: boolean
  callBeforeRefresh?: () => Promise<void>

  ignoreTopMargin?: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-info-box',
  templateUrl: './form-generator-info-box.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrl: './form-generator-info-box.component.css',
})
export class PlatformFormGeneratorCustomInfoBoxComponent extends BaseDynamicFormGeneratorControl implements OnInit {
  instructions: Promise<string>
  showRefreshButton = false
  callBeforeRefresh: () => Promise<void>

  constructor() {
    super()
  }

  async refresh() {
    await this.callBeforeRefresh()
    location.reload()
  }

  ngOnInit(): void {
    const guiOptions = this.formItem.guiOptions
    const additionalData = guiOptions?.additionalData as FormGeneratorInfoBoxAdditionalData

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
