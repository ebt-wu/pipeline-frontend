import { CommonModule } from '@angular/common'
import { Component, NO_ERRORS_SCHEMA } from '@angular/core'
import {
  BaseDynamicFormGeneratorControl,
  dynamicFormFieldProvider,
  dynamicFormGroupChildProvider,
} from '@fundamental-ngx/platform'
import { ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'fdp-form-generator-header',
  templateUrl: './form-generator-header.component.html',
  viewProviders: [dynamicFormFieldProvider, dynamicFormGroupChildProvider],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  styleUrls: ['./form-generator-header.component.css'],
})
export class PlatformFormGeneratorCustomHeaderElementComponent extends BaseDynamicFormGeneratorControl {
  subheader: Promise<string>

  constructor() {
    super()
  }

  ngOnInit(): void {
    if (this.formItem.guiOptions?.additionalData?.subheader) {
      this.subheader = this.formItem.guiOptions.additionalData.subheader()
    }
  }
}
