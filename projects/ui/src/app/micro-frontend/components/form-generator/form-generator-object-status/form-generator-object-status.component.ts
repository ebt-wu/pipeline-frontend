import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ObjectStatus, ObjectStatusComponent } from '@fundamental-ngx/core'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

export type FormGeneratorObjectStatusAdditionalData = {
  status: ObjectStatus
  label?: string
  glyph?: string
  inverted?: boolean
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-object-status',
  templateUrl: './form-generator-object-status.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ObjectStatusComponent],
})
export class PlatformFormGeneratorCustomObjectStatusComponent extends BaseDynamicFormGeneratorControl {
  constructor() {
    super()
  }
}
