import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'

@Component({
  selector: 'fdp-form-generator-info-box',
  templateUrl: './form-generator-info-box.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrls: ['./form-generator-info-box.component.css'],
})
export class PlatformFormGeneratorCustomInfoBoxComponent extends BaseDynamicFormGeneratorControl {
  instructions: Promise<string>

  constructor() {
    super()
  }

  ngOnInit(): void {
    if (this.formItem.guiOptions?.additionalData?.instructions) {
      this.instructions = this.formItem.guiOptions.additionalData.instructions()
    }
  }
}
