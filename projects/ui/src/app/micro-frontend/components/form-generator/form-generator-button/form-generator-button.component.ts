import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ButtonComponent, ButtonType } from '@fundamental-ngx/core'
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

export interface FormGeneratorButtonAdditionalData {
  label: string
  type: ButtonType
  action: () => Promise<void>
  glyph?: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-button',
  templateUrl: './form-generator-button.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ContentDensityDirective],
})
export class PlatformFormGeneratorCustomButtonComponent extends BaseDynamicFormGeneratorControl {
  constructor() {
    super()
  }
}
