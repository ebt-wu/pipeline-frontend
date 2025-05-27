import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
  BaseDynamicFormGeneratorControl,
  InputComponent,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

/** 
  Form generator component for more customizable blocking of form submission.
  It is completely hidden from the page and at same time supports validators.
*/
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fdp-form-generator-validator',
  templateUrl: './form-generator-validator.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  styleUrl: './form-generator-validator.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class PlatformFormGeneratorCustomValidatorComponent extends BaseDynamicFormGeneratorControl {
  constructor() {
    super()
  }
}
