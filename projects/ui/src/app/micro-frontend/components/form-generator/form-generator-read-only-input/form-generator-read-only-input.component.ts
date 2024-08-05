import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
  BaseDynamicFormGeneratorControl,
  InputComponent,
  FdpFormGroupModule,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { PlatformInputModule } from '@fundamental-ngx/platform/form'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-read-only-input',
  templateUrl: './form-generator-read-only-input.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FdpFormGroupModule, PlatformInputModule, InputComponent],
})
export class PlatformFormGeneratorCustomReadOnlyInputComponent extends BaseDynamicFormGeneratorControl {
  constructor() {
    super()
  }
}
